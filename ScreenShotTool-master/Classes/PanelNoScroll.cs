// from https://stackoverflow.com/questions/419774/how-can-you-stop-a-winforms-panel-from-scrolling/912610#912610

namespace ScreenShotTool
{
    class PanelNoScrollOnFocus : Panel
    {
        protected override System.Drawing.Point ScrollToControl(Control activeControl)
        {
#pragma warning disable CA1416 // Validate platform compatibility
            return DisplayRectangle.Location;
#pragma warning restore CA1416 // Validate platform compatibility
        }
    }
}
