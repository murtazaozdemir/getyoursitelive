namespace ScreenShotTool.Classes;

public class InfoTag(bool Enabled, string Name, string Description = "", string Category = "")
{

    public bool Enabled { get; set; } = Enabled;
    public string Name { get; set; } = Name;
    public string Description { get; set; } = Description;
    public string Category { get; set; } = Category;

    //public bool Visible { get; internal set; } = true;

    //public string Image { get; set; }

    public override string ToString()
    {
        return Name;
    }
}
