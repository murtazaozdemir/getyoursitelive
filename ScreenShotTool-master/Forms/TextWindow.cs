namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility
public partial class TextWindow : Form
{
    public TextWindow(string text)
    {
        InitializeComponent();
        Font = new Font(this.Font.FontFamily, 9);
        textBox1.Text = text;
    }

    private void ButtonClose_Click(object sender, EventArgs e)
    {
        Close();
    }
}
