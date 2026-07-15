using Npgsql;

namespace TahsisatWorkerService.Data;

/// <summary>
/// Node.js backend'in kullandığı PostgreSQL veritabanına bağlantı açar.
/// Mevcut şema/tablolara dokunmaz, sadece okuma/yazma yapar.
/// </summary>
public class DbConnectionFactory
{
    private readonly string _connectionString;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("BotasDb")
            ?? throw new InvalidOperationException("BotasDb connection string appsettings.json içinde bulunamadı.");
    }

    public async Task<NpgsqlConnection> CreateOpenConnectionAsync(CancellationToken cancellationToken = default)
    {
        var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);
        return connection;
    }
}
