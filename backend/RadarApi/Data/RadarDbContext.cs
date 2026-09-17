using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using RadarApi.Models;

namespace RadarApi.Data;

public class RadarDbContext : DbContext
{
    public RadarDbContext(DbContextOptions<RadarDbContext> options) : base(options)
    {
    }

    public DbSet<Signal> Signals => Set<Signal>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Tags é List<string>; guardamos como JSON no SQLite (não existe tipo array nativo).
        modelBuilder.Entity<Signal>()
            .Property(s => s.Tags)
            .HasConversion(
                tags => string.Join('', tags),
                value => value.Length == 0
                    ? new List<string>()
                    : value.Split('', StringSplitOptions.None).ToList(),
                new ValueComparer<List<string>>(
                    (a, b) => (a ?? new()).SequenceEqual(b ?? new()),
                    v => v.Aggregate(0, (hash, s) => HashCode.Combine(hash, s.GetHashCode())),
                    v => v.ToList()));
    }
}
