namespace ScreenShotTool.Controls
{
    partial class SymbolFillColor
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

        #region Component Designer generated code

        /// <summary> 
        /// Required method for Designer support - do not modify 
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            panel1 = new Panel();
            label7 = new Label();
            buttonFillColor = new Button();
            panel1.SuspendLayout();
            SuspendLayout();
            // 
            // panel1
            // 
            panel1.BorderStyle = BorderStyle.FixedSingle;
            panel1.Controls.Add(label7);
            panel1.Controls.Add(buttonFillColor);
            panel1.Dock = DockStyle.Fill;
            panel1.Location = new Point(0, 0);
            panel1.Name = "panel1";
            panel1.Size = new Size(170, 31);
            panel1.TabIndex = 0;
            // 
            // label7
            // 
            label7.AutoSize = true;
            label7.Location = new Point(3, 8);
            label7.Name = "label7";
            label7.Size = new Size(54, 15);
            label7.TabIndex = 36;
            label7.Text = "Fill Color";
            // 
            // buttonFillColor
            // 
            buttonFillColor.BackColor = Color.FromArgb(0, 192, 0);
            buttonFillColor.FlatAppearance.BorderColor = Color.Black;
            buttonFillColor.FlatStyle = FlatStyle.Flat;
            buttonFillColor.Location = new Point(109, 3);
            buttonFillColor.Name = "buttonFillColor";
            buttonFillColor.Size = new Size(55, 23);
            buttonFillColor.TabIndex = 37;
            buttonFillColor.Tag = "FillColor";
            buttonFillColor.UseVisualStyleBackColor = false;
            // 
            // SymbolFill
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            Controls.Add(panel1);
            Name = "SymbolFill";
            Size = new Size(170, 31);
            panel1.ResumeLayout(false);
            panel1.PerformLayout();
            ResumeLayout(false);
        }

        #endregion

        private Panel panel1;
        private Label label7;
        internal Button buttonFillColor;
    }
}
