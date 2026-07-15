using Cronos;

namespace TahsisatWorkerService.Services;

/// <summary>
/// Her gün appsettings.json'da belirtilen saatte (varsayılan 10:00, Europe/Istanbul)
/// AllocationService.ProcessDailyAllocationAsync() metodunu tetikler.
/// </summary>
public class DailyAllocationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DailyAllocationWorker> _logger;
    private readonly CronExpression _cronExpression;
    private readonly TimeZoneInfo _timeZone;

    public DailyAllocationWorker(IServiceProvider serviceProvider, IConfiguration configuration, ILogger<DailyAllocationWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;

        var hour = configuration.GetValue<int>("AllocationSettings:DailyRunHour", 10);
        var minute = configuration.GetValue<int>("AllocationSettings:DailyRunMinute", 0);
        var tzId = configuration.GetValue<string>("AllocationSettings:TimeZoneId", "Europe/Istanbul");

        // Cron formatı: dakika saat gün ay haftagünü  -> her gün "hour:minute"
        _cronExpression = CronExpression.Parse($"{minute} {hour} * * *");
        _timeZone = ResolveTimeZone(tzId ?? "Europe/Istanbul");
    }

    /// <summary>
    /// Windows'ta IANA ID'leri (Europe/Istanbul) bulunamayabilir, bu yüzden
    /// Windows'un kendi ID'sini (Turkey Standard Time) de deneriz.
    /// </summary>
    private static TimeZoneInfo ResolveTimeZone(string ianaOrWindowsId)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(ianaOrWindowsId);
        }
        catch (TimeZoneNotFoundException)
        {
            // IANA ID bulunamadı, Windows karşılığını dene
            return TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time");
}       }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Günlük tahsisat worker'ı başlatıldı. Zamanlama: {Cron} ({TimeZone})",
            _cronExpression.ToString(), _timeZone.Id);

        while (!stoppingToken.IsCancellationRequested)
        {
            var nextUtc = _cronExpression.GetNextOccurrence(DateTimeOffset.UtcNow, _timeZone);

            if (nextUtc is null)
            {
                _logger.LogWarning("Bir sonraki çalışma zamanı hesaplanamadı, worker durduruluyor.");
                break;
            }

            var delay = nextUtc.Value - DateTimeOffset.UtcNow;
            if (delay > TimeSpan.Zero)
            {
                _logger.LogInformation("Bir sonraki tahsisat işlemi: {NextRun}", nextUtc.Value.ToLocalTime());
                await Task.Delay(delay, stoppingToken);
            }

            if (stoppingToken.IsCancellationRequested) break;

            await RunAllocationSafelyAsync(stoppingToken);
        }
    }

    private async Task RunAllocationSafelyAsync(CancellationToken stoppingToken)
    {
        try
        {
            // BackgroundService singleton olduğu için scoped servisleri burada resolve ediyoruz
            using var scope = _serviceProvider.CreateScope();
            var allocationService = scope.ServiceProvider.GetRequiredService<AllocationService>();

            var count = await allocationService.ProcessDailyAllocationAsync(stoppingToken);
            _logger.LogInformation("Günlük tahsisat işlemi tamamlandı. {Count} yeni tahsisat oluşturuldu.", count);
        }
        catch (Exception ex)
        {
            // Hata olsa bile worker döngüsü çökmemeli, bir sonraki güne devam etmeli
            _logger.LogError(ex, "Günlük tahsisat işlemi sırasında hata oluştu.");
        }
    }
}
