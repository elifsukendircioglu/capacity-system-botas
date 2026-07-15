using TahsisatWorkerService.Data;
using TahsisatWorkerService.Services;

var builder = WebApplication.CreateBuilder(args);

// --- Servis kayıtları ---
builder.Services.AddSingleton<DbConnectionFactory>();
builder.Services.AddScoped<AllocationService>();
builder.Services.AddHostedService<DailyAllocationWorker>();

builder.Services.AddCors(options =>
{
    // React frontend'in bu API'yi çağırabilmesi için.
    // Prod'da AllowAnyOrigin yerine gerçek frontend adresini yaz.
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("FrontendPolicy");

// --- API Endpoint'leri ---

// Admin: tüm noktalara ait tahsisat zaman serisi
app.MapGet("/api/tahsisat/grafik/admin", async (AllocationService allocationService, CancellationToken ct) =>
{
    var data = await allocationService.GetAllAllocationsAsync(ct);
    return Results.Ok(data);
});

// User: sadece kendi tahsisatları
app.MapGet("/api/tahsisat/grafik/user/{userId:int}", async (int userId, AllocationService allocationService, CancellationToken ct) =>
{
    var data = await allocationService.GetUserAllocationsAsync(userId, ct);
    return Results.Ok(data);
});

// Manuel tetikleme (test/debug amaçlı - normalde worker otomatik çalışır)
app.MapPost("/api/tahsisat/calistir", async (AllocationService allocationService, CancellationToken ct) =>
{
    var count = await allocationService.ProcessDailyAllocationAsync(ct);
    return Results.Ok(new { insertedCount = count });
});

app.Run();
