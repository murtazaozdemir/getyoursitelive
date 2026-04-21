namespace ScreenShotTool.Forms;
#pragma warning disable CA1416 // Validate platform compatibility
public partial class NewImagePrompt : Form
{
    public Color BackgroundColor = Color.White;
    public int ImageWidth = 500;
    public int ImageHeight = 500;

    public NewImagePrompt()
    {
        InitializeComponent();
        Font = new Font(this.Font.FontFamily, 9);
        numericWidth.Value = ImageWidth;
        numericHeight.Value = ImageHeight;
        ColorTools.SetButtonColors(buttonColor, BackgroundColor, true);
    }

    private void SelectColor_Click(object sender, EventArgs e)
    {
        ColorDialogAlpha colorDialogAlpha = new(Color.White);
        DialogResult result = colorDialogAlpha.ShowDialog();
        //DialogResult result = colorDialog1.ShowDialog();
        if (result == DialogResult.OK)
        {
            //buttonColor.BackColor = colorDialogAlpha.Color;
            ColorTools.SetButtonColors(buttonColor, colorDialogAlpha.Color, true);
            BackgroundColor = colorDialogAlpha.Color;
        }
    }

    private void ButtonCancel_Click(object sender, EventArgs e)
    {
        DialogResult = DialogResult.Cancel;
    }

    private void ButtonOK_Click(object sender, EventArgs e)
    {
        DialogResult = DialogResult.OK;
        ImageWidth = (int)numericWidth.Value;
        ImageHeight = (int)numericHeight.Value;
    }
}
