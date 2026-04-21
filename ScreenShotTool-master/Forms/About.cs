using System.Diagnostics;
using System.Runtime.Versioning;

namespace ScreenShotTool
{
    [SupportedOSPlatform("windows")]
    public partial class About : Form
    {
        public About()
        {
            InitializeComponent();
            Font = new Font(this.Font.FontFamily, 9);
            string applicationVersion = Application.ProductVersion;
            //string controlVersion = ProductVersion;

            Debug.WriteLine($"Application version: {applicationVersion}");
            //Debug.WriteLine($"control version: {controlVersion}");

            if (applicationVersion == "1.0.0.0")
            {
                applicationVersion = "ClickOnce (Check .exe details)";
            }
            labelVersion.Text = "Version: " + applicationVersion;
        }

        private void LinkLabel1_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            MainForm.OpenLink("https://github.com/snjo/ScreenShotTool/");
        }
    }
}
