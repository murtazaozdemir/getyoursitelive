using System.Runtime.Versioning;

namespace ScreenShotTool.Forms;
[SupportedOSPlatform("windows")]

public partial class TextEntryDialog : Form
{
    public string TextResult = string.Empty;
    public bool ConfirmOnEnter = false;

    public TextEntryDialog(string text, bool confirmOnEnter = false, bool multiLine = true)
    {
        InitializeComponent();
        textBox1.Text = text;
        ConfirmOnEnter = confirmOnEnter;
        textBox1.Multiline = multiLine;

        if (multiLine == false)
        {
            this.Height = 60 + textBox1.Bottom + panel1.Height; // adjust size of form if multiline
        }

    }

    private void TextBox1_TextChanged(object sender, EventArgs e)
    {
        TextResult = textBox1.Text;
    }

    private void ButtonOK_Click(object sender, EventArgs e)
    {
        ConfirmDialog();
    }

    private void TextEntryDialog_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.KeyCode == Keys.Escape)
        {
            DialogResult = DialogResult.Cancel;
        }
        if (e.KeyCode == Keys.Enter && ConfirmOnEnter)
        {
            ConfirmDialog();
        }
    }

    private void ConfirmDialog()
    {
        TextResult = textBox1.Text;
        DialogResult = DialogResult.OK;
    }
}
