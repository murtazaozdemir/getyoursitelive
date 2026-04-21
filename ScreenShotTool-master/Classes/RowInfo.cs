namespace ScreenShotTool
{
    internal class RowInfo(int width, int Left, int Top)
    {
        public int Width = width;
        public int Left = Left;
        public int Top = Top;
        public int X = 0;
        public int Y = 0;
        public float[] CurrentRow = new float[width + 2]; // + to avoid index error
        public float[] NextRow = new float[width + 2];
    }
}