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
        // Tags is a List<string>; we store it as a delimited string in SQLite (no native array type).
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
