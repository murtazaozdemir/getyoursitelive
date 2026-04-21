using System.Diagnostics;
using System.Runtime.Versioning;

namespace ScreenShotTool.Controls
{
    [SupportedOSPlatform("windows")]
    public partial class SymbolFont : UserControl
    {
        public SymbolFont()
        {
            InitializeComponent();
            if (comboBoxTextRenderingHint.SelectedIndex < 0)
            { 
                comboBoxTextRenderingHint.SelectedIndex = 0;
            }
        }
    }
}
