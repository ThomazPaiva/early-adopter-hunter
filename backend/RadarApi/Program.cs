using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using RadarApi.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<RadarDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // serialize the SignalStatus enum as a string ("New", "Watching"...)
        // instead of a number, so it's ready to use on the frontend
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS open for Angular running on localhost:4200 (default ng serve)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Apply pending migrations.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<RadarDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngularDev");
app.UseAuthorization();
app.MapControllers();

app.Run();
