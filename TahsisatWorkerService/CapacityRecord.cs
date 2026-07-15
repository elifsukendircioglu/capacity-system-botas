namespace TahsisatWorkerService.Models;

/// <summary>
/// "capacity" tablosundaki bir satırı temsil eder.
/// </summary>
public class CapacityRecord
{
    public int Id { get; set; }
    public int IdUser { get; set; }
    public double Capacity { get; set; }
    public double Energy { get; set; }
    public double Tempreture { get; set; }
    public double Pressure { get; set; }
    public double Flow { get; set; }
    public int PointId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
