using Npgsql;
using TahsisatWorkerService.Data;
using TahsisatWorkerService.Models;

namespace TahsisatWorkerService.Services;

public class AllocationService
{
    private readonly DbConnectionFactory _dbFactory;
    private readonly ILogger<AllocationService> _logger;
    private readonly double _capacityMultiplier;

    public AllocationService(DbConnectionFactory dbFactory, IConfiguration configuration, ILogger<AllocationService> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
        _capacityMultiplier = configuration.GetValue<double>("AllocationSettings:CapacityMultiplier", 2.5);
    }

    /// <summary>
    /// Henüz tahsisat yapılmamış (allocation tablosunda karşılığı olmayan) approved capacity
    /// kayıtlarını bulur, her biri için allocated_amount = capacity * 2.5 hesaplayıp
    /// allocation tablosuna ayrı ayrı satır olarak yazar.
    /// </summary>
    public async Task<int> ProcessDailyAllocationAsync(CancellationToken cancellationToken = default)
    {
        await using var connection = await _dbFactory.CreateOpenConnectionAsync(cancellationToken);

        // Henüz işlenmemiş (allocation tablosunda karşılığı olmayan) approved capacity kayıtları
        const string selectSql = @"
            SELECT c.id, c.id_user, c.capacity, c.energy, c.tempreture, c.pressure, c.flow,
                   c.point_id, c.status, c.created_at
            FROM ""Capacity"" c
            WHERE c.status = 'approved'
              AND NOT EXISTS (
                  SELECT 1 FROM allocation a WHERE a.capacity_id = c.id
              );";

        var pendingCapacities = new List<CapacityRecord>();

        await using (var selectCmd = new NpgsqlCommand(selectSql, connection))
        await using (var reader = await selectCmd.ExecuteReaderAsync(cancellationToken))
        {
            while (await reader.ReadAsync(cancellationToken))
            {
                pendingCapacities.Add(new CapacityRecord
                {
                    Id = reader.GetInt32(0),
                    IdUser = reader.GetInt32(1),
                    Capacity = reader.GetDouble(2),
                    Energy = reader.GetDouble(3),
                    Tempreture = reader.GetDouble(4),
                    Pressure = reader.GetDouble(5),
                    Flow = reader.GetDouble(6),
                    PointId = reader.GetInt32(7),
                    Status = reader.GetString(8),
                    CreatedAt = reader.GetDateTime(9)
                });
            }
        }

        _logger.LogInformation("Tahsisat işlemi başlıyor: {Count} adet işlenmemiş approved capacity kaydı bulundu.", pendingCapacities.Count);

        int insertedCount = 0;
        const string insertSql = @"
            INSERT INTO allocation (capacity_id, point_id, allocated_amount, allocated_at)
            VALUES (@capacityId, @pointId, @allocatedAmount, @allocatedAt);";

        foreach (var cap in pendingCapacities)
        {
            var allocatedAmount = cap.Capacity * _capacityMultiplier;

            await using var insertCmd = new NpgsqlCommand(insertSql, connection);
            insertCmd.Parameters.AddWithValue("capacityId", cap.Id);
            insertCmd.Parameters.AddWithValue("pointId", cap.PointId);
            insertCmd.Parameters.AddWithValue("allocatedAmount", allocatedAmount);
            insertCmd.Parameters.AddWithValue("allocatedAt", DateTime.Now);

            await insertCmd.ExecuteNonQueryAsync(cancellationToken);
            insertedCount++;

            _logger.LogInformation(
                "Tahsisat oluşturuldu: capacity_id={CapacityId}, point_id={PointId}, capacity={Capacity} x {Multiplier} = {Allocated}",
                cap.Id, cap.PointId, cap.Capacity, _capacityMultiplier, allocatedAmount);
        }

        return insertedCount;
    }

    /// <summary>
    /// Admin için: tüm noktalara ait tahsisat geçmişini zaman serisi olarak döner.
    /// </summary>
    public async Task<List<AllocationChartPoint>> GetAllAllocationsAsync(CancellationToken cancellationToken = default)
    {
        return await GetAllocationsInternalAsync(userId: null, cancellationToken);
    }

    /// <summary>
    /// User için: sadece kendi capacity taleplerinden doğan tahsisatları döner.
    /// </summary>
    public async Task<List<AllocationChartPoint>> GetUserAllocationsAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await GetAllocationsInternalAsync(userId, cancellationToken);
    }

    private async Task<List<AllocationChartPoint>> GetAllocationsInternalAsync(int? userId, CancellationToken cancellationToken)
    {
        await using var connection = await _dbFactory.CreateOpenConnectionAsync(cancellationToken);

        var sql = @"
            SELECT a.id, a.capacity_id, a.point_id, a.allocated_amount, a.allocated_at, c.capacity
            FROM allocation a
            JOIN ""Capacity"" c ON c.id = a.capacity_id
            {WHERE_CLAUSE}
            ORDER BY a.allocated_at ASC;";

        sql = sql.Replace("{WHERE_CLAUSE}", userId.HasValue ? "WHERE c.id_user = @userId" : "");

        await using var cmd = new NpgsqlCommand(sql, connection);
        if (userId.HasValue)
        {
            cmd.Parameters.AddWithValue("userId", userId.Value);
        }

        var results = new List<AllocationChartPoint>();
        await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            results.Add(new AllocationChartPoint
            {
                AllocationId = reader.GetInt32(0),
                CapacityId = reader.GetInt32(1),
                PointId = reader.GetInt32(2),
                AllocatedAmount = reader.GetDouble(3),
                AllocatedAt = reader.GetDateTime(4),
                SourceCapacity = reader.GetDouble(5)
            });
        }

        return results;
    }
}