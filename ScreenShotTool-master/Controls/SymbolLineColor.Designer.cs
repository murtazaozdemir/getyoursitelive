namespace ScreenShotTool.Controls
{
    partial class SymbolLineColor
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
            numericLineWeight = new NumericUpDown();
            label6 = new Label();
            buttonLineColor = new Button();
            label8 = new Label();
            panel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)numericLineWeight).BeginInit();
            SuspendLayout();
            // 
            // panel1
            // 
            panel1.BorderStyle = BorderStyle.FixedSingle;
            panel1.Controls.Add(numericLineWeight);
            panel1.Controls.Add(label6);
            panel1.Controls.Add(buttonLineColor);
            panel1.Controls.Add(label8);
            panel1.Dock = DockStyle.Fill;
            panel1.Location = new Point(0, 0);
            panel1.Name = "panel1";
            panel1.Size = new Size(170, 58);
            panel1.TabIndex = 0;
            // 
            // numericLineWeight
            // 
            numericLineWeight.Location = new Point(109, 31);
            numericLineWeight.Maximum = new decimal(new int[] { 50, 0, 0, 0 });
            numericLineWeight.Name = "numericLineWeight";
            numericLineWeight.Size = new Size(55, 23);
            numericLineWeight.TabIndex = 41;
            numericLineWeight.Tag = "LineWeight";
            numericLineWeight.Value = new decimal(new int[] { 1, 0, 0, 0 });
            // 
            // label6
            // 
            label6.AutoSize = true;
            label6.Location = new Point(3, 7);
            label6.Name = "label6";
            label6.Size = new Size(61, 15);
            label6.TabIndex = 38;
            label6.Text = "Line Color";
            // 
            // buttonLineColor
            // 
            buttonLineColor.BackColor = Color.FromArgb(0, 192, 0);
            buttonLineColor.FlatAppearance.BorderColor = Color.Black;
            buttonLineColor.FlatStyle = FlatStyle.Flat;
            buttonLineColor.Location = new Point(109, 3);
            buttonLineColor.Name = "buttonLineColor";
            buttonLineColor.Size = new Size(55, 23);
            buttonLineColor.TabIndex = 40;
            buttonLineColor.Tag = "LineColor";
            buttonLineColor.UseVisualStyleBackColor = false;
            // 
            // label8
            // 
            label8.AutoSize = true;
            label8.Location = new Point(3, 33);
            label8.Name = "label8";
            label8.Size = new Size(64, 15);
            label8.TabIndex = 39;
            label8.Text = "Line Width";
            // 
            // SymbolLineColor
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            Controls.Add(panel1);
            Name = "SymbolLineColor";
            Size = new Size(170, 58);
            panel1.ResumeLayout(false);
            panel1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)numericLineWeight).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private Panel panel1;
        private Label label6;
        private Label label8;
        internal NumericUpDown numericLineWeight;
        internal Button buttonLineColor;
    }
}
