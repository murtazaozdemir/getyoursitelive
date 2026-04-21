namespace ScreenShotTool
{
    partial class ImageView
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(ImageView));
            pictureBoxScreenshot = new PictureBox();
            panel1 = new Panel();
            pictureBoxDraw = new PictureBox();
            ((System.ComponentModel.ISupportInitialize)pictureBoxScreenshot).BeginInit();
            panel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)pictureBoxDraw).BeginInit();
            SuspendLayout();
            // 
            // pictureBoxScreenshot
            // 
            pictureBoxScreenshot.BackgroundImageLayout = ImageLayout.None;
            pictureBoxScreenshot.Location = new Point(0, 0);
            pictureBoxScreenshot.Name = "pictureBoxScreenshot";
            pictureBoxScreenshot.Size = new Size(800, 450);
            pictureBoxScreenshot.SizeMode = PictureBoxSizeMode.AutoSize;
            pictureBoxScreenshot.TabIndex = 0;
            pictureBoxScreenshot.TabStop = false;
            // 
            // panel1
            // 
            panel1.AutoScroll = true;
            panel1.Controls.Add(pictureBoxDraw);
            panel1.Controls.Add(pictureBoxScreenshot);
            panel1.Dock = DockStyle.Fill;
            panel1.Location = new Point(0, 0);
            panel1.Name = "panel1";
            panel1.Size = new Size(800, 510);
            panel1.TabIndex = 1;
            // 
            // pictureBoxDraw
            // 
            pictureBoxDraw.Location = new Point(143, 143);
            pictureBoxDraw.Name = "pictureBoxDraw";
            pictureBoxDraw.Size = new Size(100, 57);
            pictureBoxDraw.TabIndex = 1;
            pictureBoxDraw.TabStop = false;
            pictureBoxDraw.MouseDown += PictureBoxDraw_MouseDown;
            pictureBoxDraw.MouseLeave += PictureBoxDraw_MouseLeave;
            pictureBoxDraw.MouseMove += PictureBoxDraw_MouseMove;
            pictureBoxDraw.MouseUp += PictureBoxDraw_MouseUp;
            // 
            // ImageView
            // 
            AutoScaleDimensions = new SizeF(7F, 17F);
            AutoScaleMode = AutoScaleMode.Font;
            AutoScroll = true;
            ClientSize = new Size(800, 510);
            Controls.Add(panel1);
            Font = new Font("Segoe UI", 10F);
            FormBorderStyle = FormBorderStyle.None;
            Icon = (Icon)resources.GetObject("$this.Icon");
            KeyPreview = true;
            Name = "ImageView";
            StartPosition = FormStartPosition.Manual;
            Text = "ImageView";
            FormClosing += ImageView_FormClosing;
            Load += ImageView_Load;
            KeyDown += ImageView_KeyDown;
            ((System.ComponentModel.ISupportInitialize)pictureBoxScreenshot).EndInit();
            panel1.ResumeLayout(false);
            panel1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)pictureBoxDraw).EndInit();
            ResumeLayout(false);
        }

        #endregion
        private Panel panel1;
        public PictureBox pictureBoxDraw;
        public PictureBox pictureBoxScreenshot;
    }
}