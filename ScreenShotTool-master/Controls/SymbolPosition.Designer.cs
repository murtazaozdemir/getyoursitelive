namespace ScreenShotTool.Controls
{
    partial class SymbolPosition
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
            numericHeight = new NumericUpDown();
            numericY = new NumericUpDown();
            numericWidth = new NumericUpDown();
            numericX = new NumericUpDown();
            label5 = new Label();
            label4 = new Label();
            label3 = new Label();
            label2 = new Label();
            labelSymbolType = new Label();
            panel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)numericHeight).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericY).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericWidth).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericX).BeginInit();
            SuspendLayout();
            // 
            // panel1
            // 
            panel1.BorderStyle = BorderStyle.FixedSingle;
            panel1.Controls.Add(numericHeight);
            panel1.Controls.Add(numericY);
            panel1.Controls.Add(numericWidth);
            panel1.Controls.Add(numericX);
            panel1.Controls.Add(label5);
            panel1.Controls.Add(label4);
            panel1.Controls.Add(label3);
            panel1.Controls.Add(label2);
            panel1.Controls.Add(labelSymbolType);
            panel1.Dock = DockStyle.Fill;
            panel1.Location = new Point(0, 0);
            panel1.Name = "panel1";
            panel1.Size = new Size(170, 80);
            panel1.TabIndex = 44;
            // 
            // numericPropertiesHeight
            // 
            numericHeight.Location = new Point(110, 52);
            numericHeight.Maximum = new decimal(new int[] { 10000, 0, 0, 0 });
            numericHeight.Minimum = new decimal(new int[] { 1, 0, 0, 0 });
            numericHeight.Name = "numericPropertiesHeight";
            numericHeight.Size = new Size(55, 23);
            numericHeight.TabIndex = 52;
            numericHeight.Tag = "Height";
            numericHeight.Value = new decimal(new int[] { 1, 0, 0, 0 });
            // 
            // numericPropertiesY
            // 
            numericY.Location = new Point(110, 23);
            numericY.Maximum = new decimal(new int[] { 10000, 0, 0, 0 });
            numericY.Minimum = new decimal(new int[] { 1000, 0, 0, int.MinValue });
            numericY.Name = "numericPropertiesY";
            numericY.Size = new Size(55, 23);
            numericY.TabIndex = 50;
            numericY.Tag = "Y";
            // 
            // numericPropertiesWidth
            // 
            numericWidth.Location = new Point(21, 52);
            numericWidth.Maximum = new decimal(new int[] { 10000, 0, 0, 0 });
            numericWidth.Minimum = new decimal(new int[] { 1, 0, 0, 0 });
            numericWidth.Name = "numericPropertiesWidth";
            numericWidth.Size = new Size(55, 23);
            numericWidth.TabIndex = 51;
            numericWidth.Tag = "Width";
            numericWidth.Value = new decimal(new int[] { 1, 0, 0, 0 });
            // 
            // numericPropertiesX
            // 
            numericX.Location = new Point(21, 23);
            numericX.Maximum = new decimal(new int[] { 10000, 0, 0, 0 });
            numericX.Minimum = new decimal(new int[] { 1000, 0, 0, int.MinValue });
            numericX.Name = "numericPropertiesX";
            numericX.Size = new Size(55, 23);
            numericX.TabIndex = 49;
            numericX.Tag = "X";
            // 
            // label5
            // 
            label5.AutoSize = true;
            label5.Location = new Point(82, 54);
            label5.Name = "label5";
            label5.Size = new Size(16, 15);
            label5.TabIndex = 48;
            label5.Text = "H";
            // 
            // label4
            // 
            label4.AutoSize = true;
            label4.Location = new Point(3, 54);
            label4.Name = "label4";
            label4.Size = new Size(18, 15);
            label4.TabIndex = 47;
            label4.Text = "W";
            // 
            // label3
            // 
            label3.AutoSize = true;
            label3.Location = new Point(82, 25);
            label3.Name = "label3";
            label3.Size = new Size(14, 15);
            label3.TabIndex = 46;
            label3.Text = "Y";
            // 
            // label2
            // 
            label2.AutoSize = true;
            label2.Location = new Point(3, 25);
            label2.Name = "label2";
            label2.Size = new Size(14, 15);
            label2.TabIndex = 45;
            label2.Text = "X";
            // 
            // labelSymbolType
            // 
            labelSymbolType.AutoSize = true;
            labelSymbolType.Location = new Point(3, 3);
            labelSymbolType.Name = "labelSymbolType";
            labelSymbolType.Size = new Size(53, 15);
            labelSymbolType.TabIndex = 44;
            labelSymbolType.Text = "Symbol: ";
            // 
            // SymbolPosition
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            Controls.Add(panel1);
            Name = "SymbolPosition";
            Size = new Size(170, 80);
            panel1.ResumeLayout(false);
            panel1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)numericHeight).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericY).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericWidth).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericX).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private Panel panel1;
        private Label label5;
        private Label label4;
        private Label label3;
        private Label label2;
        internal NumericUpDown numericHeight;
        internal NumericUpDown numericY;
        internal NumericUpDown numericWidth;
        internal NumericUpDown numericX;
        internal Label labelSymbolType;
    }
}
