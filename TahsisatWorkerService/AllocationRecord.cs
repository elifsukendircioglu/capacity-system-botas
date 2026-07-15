namespace TahsisatWorkerService.Models;

/// <summary>
/// "allocation" tablosundaki bir satırı temsil eder.
/// Her approved capacity kaydı için ayrı bir tahsisat sonucu tutar.
/// </summary>
public class AllocationRecord
{
    public int Id { get; set; }
    public int CapacityId { get; set; }
    public int PointId { get; set; }
    public double AllocatedAmount { get; set; }
    public DateTime AllocatedAt { get; set; }
}

/// <summary>
/// Grafik/PDF için: tahsisat + kaynak capacity bilgisini birlikte taşıyan görünüm modeli.
/// </summary>
public class AllocationChartPoint
{
    public int AllocationId { get; set; }
    public int CapacityId { get; set; }
    public int PointId { get; set; }
    public double AllocatedAmount { get; set; }
    public DateTime AllocatedAt { get; set; }
    public double SourceCapacity { get; set; }
}
