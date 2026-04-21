using System.Numerics;

namespace ScreenShotTool
{
#pragma warning disable CA1416 // Validate platform compatibility
    public class GraphicSymbol : IDisposable
    {
        public Pen LinePen = new(Color.Gray);
        public Pen HighlightSymbolPen = new(Color.Red);
        public SolidBrush LineBrush = new(Color.Gray);
        public SolidBrush FillBrush = new(Color.Pink);
        public SolidBrush TextBrush = new(Color.Black);
        public SolidBrush ShadowBrush = new(Color.FromArgb(20, Color.Black));
        public SolidBrush HighlightBrush = new(Color.Red);
        public Pen ShadowPen = new(Color.FromArgb(50, Color.Black));
        public Color LineColor;
        public Color FillColor;
        public Color TextColor;
        public bool ScalingAllowed = true;
        public bool MoveAllowed = true;
        public bool ShadowEnabled = false;
        public int ShadowDistance = 10;

        public float Rotation = 0f;
        public bool RotationAllowed = false;
        public Rectangle ContainerBounds = new();
        public ListViewItem? ListViewItem { get; set; }
        public bool AllowClickPlacement = false;

        private int _x;
        private int _y;
        private int _width;
        private int _height;
        public virtual int Width
        {
            get { return _width; }
            set { _width = value; }
        }
        public virtual int Height
        {
            get { return _height; }
            set { _height = value; }
        }
        public virtual Point StartPoint
        {
            get { return new Point(_x, _y); }
            set
            {
                _x = (int)value.X;
                _y = (int)value.Y;
            }
        }
        public virtual Point EndPoint
        {
            get { return new Point(_width, _height); }
            set
            {
                _width = (int)value.X;
                _height = (int)value.Y;
            }
        }

        public virtual int Top { get { return _y; } set { _y = value; } }
        public virtual int Bottom { get { return _y + _height; } set { _height = value - _y; } } // ?
        public virtual int Left { get { return _x; } set { _x = value; } }
        public virtual int Right { get { return _x + _width; } set { _width = value - _x; } }

        public Vector2 StartPointV2
        {
            get { return new Vector2(StartPoint.X, StartPoint.Y); }
        }

        public Vector2 EndPointV2
        {
            get { return new Vector2(EndPoint.X, EndPoint.Y); }
        }

        public virtual Rectangle Bounds
        {
            get { return new Rectangle(Left, Top, Width, Height); }
        }

        public virtual Point Position
        { get { return new Point(Left, Top); } }

        public virtual void Move(int x, int y)
        {
            MoveTo(Left += x, Top += y);
        }

        public virtual void MoveTo(int x, int y)
        {
            Left = x;
            Top = y;
        }

        public virtual void MoveLeftEdgeTo(int x)
        {
            int oldRight = Right;
            Left = Math.Min(x, Right - 1); // don't go beyond the right edge, width is minimum 1
            Width = oldRight - Left;
        }

        public virtual void MoveTopEdgeTo(int y)
        {
            int oldBottom = Bottom;
            Top = Math.Min(y, Bottom - 1);
            Height = oldBottom - Top;
        }

        public virtual void MoveRightEdgeTo(int x)
        {
            Right = Math.Max(x, Left + 1); // don't go beyond the left edge, width is minimum 1
        }

        public virtual void MoveBottomEdgeTo(int y)
        {
            Bottom = Math.Max(y, Top + 1);
        }

        public virtual int LineWeight
        {
            get; set;
        }
        public string Name = "Blank";

        public bool ValidSymbol = false;

        public GraphicSymbol(Point startPoint, Point endPoint, Color foregroundColor, Color backgroundColor, bool shadowEnabled = false, int lineWeight = 1)
        {
            this.LineColor = foregroundColor;
            this.FillColor = backgroundColor;
            this.TextColor = foregroundColor;
            this.Left = startPoint.X;
            this.Top = startPoint.Y;
            this.Right = endPoint.X;
            this.Bottom = endPoint.Y;
            this.LineWeight = lineWeight;
            this.ShadowEnabled = shadowEnabled;
            HighlightSymbolPen.DashPattern = [2f, 8f];
            //Hitboxes = CreateHitboxList();
        }

        public GraphicSymbol(Point startPoint, Point endPoint, bool shadow = false)
        {
            this.LineColor = Color.Black;
            this.FillColor = Color.White;
            this.TextColor = Color.Black;
            this.Left = startPoint.X;
            this.Top = startPoint.Y;
            this.Right = endPoint.X;
            this.Bottom = endPoint.Y;
            this.LineWeight = 1;
            this.ShadowEnabled = shadow;
            HighlightSymbolPen.DashPattern = [2f, 8f];
            //Hitboxes = CreateHitboxList();
        }

        public virtual void DrawSymbol(Graphics graphic)
        {
            UpdateColors();
            UpdatePen();
            DrawShadow(graphic);
            DrawShape(graphic, LinePen, FillBrush, new Point(0, 0), true, true);
        }

        public virtual void DrawShadow(Graphics graphic)
        {
            int largestSide = Math.Max(Width, Height);
            int adjustedShadowDistance = Math.Min(ShadowDistance, largestSide / 5);
            if (ShadowEnabled)
            {
                //fill
                DrawShape(graphic, ShadowPen, ShadowBrush, new Point(adjustedShadowDistance, adjustedShadowDistance), true, false);

                bool DrawShadowLine = (FillColor.A < 128);
                // line
                DrawShape(graphic, ShadowPen, ShadowBrush, new Point(adjustedShadowDistance, adjustedShadowDistance), false, DrawShadowLine);
            }
        }

        internal virtual void DrawShape(Graphics graphic, Pen drawPen, Brush drawBrush, Point offset, bool fill = true, bool outline = true)
        {
        }

        internal int anchorsize = 8;
        internal int anchorHalf = 4;
        Rectangle BoundsShifted
        {
            get
            {
                return new Rectangle(Bounds.X - anchorHalf, Bounds.Y - anchorHalf, Bounds.Width, Bounds.Height);
            }
        }

        enum HitboxDirection
        {
            Center = 0,
            NW = 1,
            N = 2,
            NE = 3,
            W = 4,
            E = 5,
            SW = 6,
            S = 7,
            SE = 8,
        }

        public virtual Rectangle GetHitbox(int index)
        {
            return index switch
            {
                0 => HitboxCenter,
                1 => HitboxNW,
                2 => HitboxN,
                3 => HitboxNE,
                4 => HitboxW,
                5 => HitboxE,
                6 => HitboxSW,
                7 => HitboxS,
                8 => HitboxSE,
                _ => new Rectangle(0, 0, 0, 0),
            };
        }
        public Rectangle HitboxNW { get { return new Rectangle(BoundsShifted.Left, BoundsShifted.Top, anchorsize, anchorsize); } }
        public Rectangle HitboxN { get { return new Rectangle(BoundsShifted.Left + (BoundsShifted.Right - Bounds.Left) / 2, BoundsShifted.Top, anchorsize, anchorsize); } }
        public Rectangle HitboxNE { get { return new Rectangle(BoundsShifted.Right, BoundsShifted.Top, anchorsize, anchorsize); } }
        public Rectangle HitboxW { get { return new Rectangle(BoundsShifted.Left, BoundsShifted.Top + (BoundsShifted.Bottom - Bounds.Top) / 2, anchorsize, anchorsize); } }
        public Rectangle HitboxE { get { return new Rectangle(BoundsShifted.Right, BoundsShifted.Top + (BoundsShifted.Bottom - Bounds.Top) / 2, anchorsize, anchorsize); } }
        public Rectangle HitboxSW { get { return new Rectangle(BoundsShifted.Left, BoundsShifted.Bottom, anchorsize, anchorsize); } }
        public Rectangle HitboxS { get { return new Rectangle(BoundsShifted.Left + (BoundsShifted.Right - Bounds.Left) / 2, BoundsShifted.Bottom, anchorsize, anchorsize); } }
        public Rectangle HitboxSE { get { return new Rectangle(BoundsShifted.Right, BoundsShifted.Bottom, anchorsize, anchorsize); } }
        //public Rectangle HitboxCenter { get { return new Rectangle(boundsShifted.Left + (boundsShifted.Right - Bounds.Left) / 2, boundsShifted.Top + (boundsShifted.Bottom - Bounds.Top) / 2, anchorsize, anchorsize); } }
        public Rectangle HitboxCenter { get { return new Rectangle(Bounds.Left, Bounds.Top, Bounds.Width, Bounds.Height); } }

        public virtual void DrawHitboxes(Graphics graphic)
        {
            for (int i = 1; i <= 8; i++) // start at 1 to skip center hitbox drawing
            {
                graphic.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.None;
                graphic.FillRectangle(HighlightBrush, GetHitbox(i));
                graphic.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            }
        }

        internal virtual void UpdatePen()
        {
            LineBrush = new SolidBrush(LineColor);
            LinePen.Brush = LineBrush;
            LinePen.Width = LineWeight;

            FillBrush = new SolidBrush(FillColor);
            ShadowBrush.Color = Color.FromArgb(FillBrush.Color.A / 5, Color.Black);
            ShadowPen.Color = Color.FromArgb(LineBrush.Color.A / 5, Color.Black);
            ShadowPen.Width = LineWeight;

            TextBrush.Color = TextColor;
        }

        internal void UpdateColors()
        {
            TextColor = LineColor;
        }

        public virtual void DisposeImages()
        {
        }

        private bool disposed = false;
        public virtual void Dispose()
        {
            Dispose(true);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposed)
            {
                disposed = true;

                if (disposing)
                {
                    // Clean up managed resources, like files or GDI objects
                    DisposeImages();
                    LinePen.Dispose();
                    HighlightSymbolPen.Dispose();
                    LineBrush.Dispose();
                    FillBrush.Dispose();
                    TextBrush.Dispose();
                    ShadowBrush.Dispose();
                    HighlightBrush.Dispose();
                    ShadowPen.Dispose();
                }

                // Clean up unmanaged resources, like COM components
            }
        }

        ~GraphicSymbol() // the finalizer
        {
            Dispose(false);
        }
    }
}

