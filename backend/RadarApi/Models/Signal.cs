namespace RadarApi.Models;

public class Signal
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Context { get; set; }

    // As 5 perguntas do framework
    public string? Q1 { get; set; } // Isso pode virar alguma coisa?
    public string? Q2 { get; set; } // O que ficou possível agora?
    public string? Q3 { get; set; } // O que as pessoas podem começar a fazer por causa disso?
    public string? Q4 { get; set; } // Que problema novo isso cria?
    public string? Q5 { get; set; } // O que ainda não existe para resolver esse problema?

    public List<string> Tags { get; set; } = new();
    public SignalStatus Status { get; set; } = SignalStatus.Novo;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum SignalStatus
{
    Novo,
    Observando,
    Oportunidade,
    Descartado
}

// DTO usado para criar/editar, sem expor Id/CreatedAt no corpo da requisição
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
    public SignalStatus Status { get; set; } = SignalStatus.Novo;
}
