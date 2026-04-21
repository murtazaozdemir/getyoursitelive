namespace ScreenShotTool
{
    partial class About
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(About));
            label1 = new Label();
            labelVersion = new Label();
            label2 = new Label();
            label3 = new Label();
            linkLabel1 = new LinkLabel();
            pictureBox1 = new PictureBox();
            ((System.ComponentModel.ISupportInitialize)pictureBox1).BeginInit();
            SuspendLayout();
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Font = new Font("Segoe UI", 12F, FontStyle.Bold);
            label1.Location = new Point(47, 9);
            label1.Name = "label1";
            label1.Size = new Size(131, 21);
            label1.TabIndex = 0;
            label1.Text = "Screenshot Tool";
            // 
            // labelVersion
            // 
            labelVersion.AutoSize = true;
            labelVersion.Location = new Point(47, 65);
            labelVersion.Name = "labelVersion";
            labelVersion.Size = new Size(51, 15);
            labelVersion.TabIndex = 1;
            labelVersion.Text = "Version: ";
            // 
            // label2
            // 
            label2.AutoSize = true;
            label2.Location = new Point(47, 30);
            label2.Name = "label2";
            label2.Size = new Size(186, 15);
            label2.TabIndex = 2;
            label2.Text = "By Andreas Aakvik Gogstad (2023)";
            // 
            // label3
            // 
            label3.AutoSize = true;
            label3.Location = new Point(47, 95);
            label3.Name = "label3";
            label3.Size = new Size(142, 15);
            label3.TabIndex = 3;
            label3.Text = "Website and source code:";
            // 
            // linkLabel1
            // 
            linkLabel1.AutoSize = true;
            linkLabel1.Location = new Point(47, 110);
            linkLabel1.Name = "linkLabel1";
            linkLabel1.Size = new Size(227, 15);
            linkLabel1.TabIndex = 4;
            linkLabel1.TabStop = true;
            linkLabel1.Text = "https://github.com/snjo/ScreenShotTool/";
            linkLabel1.LinkClicked += LinkLabel1_LinkClicked;
            // 
            // pictureBox1
            // 
            pictureBox1.ErrorImage = null;
            pictureBox1.Image = Properties.Resources.icon256;
            pictureBox1.InitialImage = null;
            pictureBox1.Location = new Point(47, 165);
            pictureBox1.Name = "pictureBox1";
            pictureBox1.Size = new Size(256, 256);
            pictureBox1.TabIndex = 5;
            pictureBox1.TabStop = false;
            // 
            // About
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(363, 444);
            Controls.Add(pictureBox1);
            Controls.Add(linkLabel1);
            Controls.Add(label3);
            Controls.Add(label2);
            Controls.Add(labelVersion);
            Controls.Add(label1);
            FormBorderStyle = FormBorderStyle.FixedToolWindow;
            Icon = (Icon)resources.GetObject("$this.Icon");
            Name = "About";
            Text = "About Screenshot Tool";
            ((System.ComponentModel.ISupportInitialize)pictureBox1).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label label1;
        private Label labelVersion;
        private Label label2;
        private Label label3;
        private LinkLabel linkLabel1;
        private PictureBox pictureBox1;
    }
}