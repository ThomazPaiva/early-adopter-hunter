namespace RadarApi.Models;

public class Signal
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Context { get; set; }

    // The framework's 5 questions
    public string? Q1 { get; set; } // Could this turn into something?
    public string? Q2 { get; set; } // What became possible now?
    public string? Q3 { get; set; } // What can people start doing because of this?
    public string? Q4 { get; set; } // What new problem does this create?
    public string? Q5 { get; set; } // What doesn't exist yet to solve this problem?

    public List<string> Tags { get; set; } = new();
    public SignalStatus Status { get; set; } = SignalStatus.New;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum SignalStatus
{
    New,
    Watching,
    Opportunity,
    Discarded
}

// DTO used to create/edit, without exposing Id/CreatedAt in the request body
public class SignalInput
{
    public string Title { get; set; } = string.Empty;
    public string? Context { get; set; }
    public string? Q1 { get; set; }
    public string? Q2 { get; set; }
    public string? Q3 { get; set; }
    public string? Q4 { get; set; }
    public string? Q5 { get; set; }
    public List<string> Tags { get; set; } = new();
    public SignalStatus Status { get; set; } = SignalStatus.New;
}
