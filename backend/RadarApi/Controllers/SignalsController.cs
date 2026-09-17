using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RadarApi.Data;
using RadarApi.Models;

namespace RadarApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SignalsController : ControllerBase
{
    private readonly RadarDbContext _db;

    public SignalsController(RadarDbContext db)
    {
        _db = db;
    }

    // GET api/signals
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Signal>>> GetAll()
    {
        var signals = await _db.Signals
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
        return Ok(signals);
    }

    // GET api/signals/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Signal>> GetById(int id)
    {
        var signal = await _db.Signals.FindAsync(id);
        if (signal is null) return NotFound();
        return Ok(signal);
    }

    // POST api/signals
    [HttpPost]
    public async Task<ActionResult<Signal>> Create([FromBody] SignalInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Title))
            return BadRequest(new { message = "Title is required." });

        var signal = new Signal
        {
            Title = input.Title,
            Context = input.Context,
            Q1 = input.Q1,
            Q2 = input.Q2,
            Q3 = input.Q3,
            Q4 = input.Q4,
            Q5 = input.Q5,
            Tags = input.Tags ?? new List<string>(),
            Status = input.Status,
            CreatedAt = DateTime.UtcNow
        };

        _db.Signals.Add(signal);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = signal.Id }, signal);
    }

    // PUT api/signals/5
    [HttpPut("{id}")]
    public async Task<ActionResult<Signal>> Update(int id, [FromBody] SignalInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Title))
            return BadRequest(new { message = "Title is required." });

        var signal = await _db.Signals.FindAsync(id);
        if (signal is null) return NotFound();

        signal.Title = input.Title;
        signal.Context = input.Context;
        signal.Q1 = input.Q1;
        signal.Q2 = input.Q2;
        signal.Q3 = input.Q3;
        signal.Q4 = input.Q4;
        signal.Q5 = input.Q5;
        signal.Tags = input.Tags ?? new List<string>();
        signal.Status = input.Status;

        await _db.SaveChangesAsync();
        return Ok(signal);
    }

    // DELETE api/signals/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var signal = await _db.Signals.FindAsync(id);
        if (signal is null) return NotFound();

        _db.Signals.Remove(signal);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
