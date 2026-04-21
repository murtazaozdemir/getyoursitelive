namespace ScreenShotTool.Controls
{
    partial class SymbolCurve
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
            panelPropertiesPolygon = new Panel();
            labelCurveTension = new Label();
            numericCurveTension = new NumericUpDown();
            checkBoxCloseCurve = new CheckBox();
            panelPropertiesPolygon.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)numericCurveTension).BeginInit();
            SuspendLayout();
            // 
            // panelPropertiesPolygon
            // 
            panelPropertiesPolygon.BorderStyle = BorderStyle.FixedSingle;
            panelPropertiesPolygon.Controls.Add(labelCurveTension);
            panelPropertiesPolygon.Controls.Add(numericCurveTension);
            panelPropertiesPolygon.Controls.Add(checkBoxCloseCurve);
            panelPropertiesPolygon.Dock = DockStyle.Fill;
            panelPropertiesPolygon.Location = new Point(0, 0);
            panelPropertiesPolygon.Name = "panelPropertiesPolygon";
            panelPropertiesPolygon.Size = new Size(170, 53);
            panelPropertiesPolygon.TabIndex = 106;
            // 
            // labelCurveTension
            // 
            labelCurveTension.AutoSize = true;
            labelCurveTension.Location = new Point(4, 26);
            labelCurveTension.Name = "labelCurveTension";
            labelCurveTension.Size = new Size(80, 15);
            labelCurveTension.TabIndex = 2;
            labelCurveTension.Text = "Curve tension";
            // 
            // numericPropertiesCurveTension
            // 
            numericCurveTension.DecimalPlaces = 1;
            numericCurveTension.Increment = new decimal(new int[] { 1, 0, 0, 65536 });
            numericCurveTension.Location = new Point(110, 24);
            numericCurveTension.Maximum = new decimal(new int[] { 1, 0, 0, 0 });
            numericCurveTension.Name = "numericPropertiesCurveTension";
            numericCurveTension.Size = new Size(55, 23);
            numericCurveTension.TabIndex = 50;
            numericCurveTension.Value = new decimal(new int[] { 5, 0, 0, 65536 });
            // 
            // checkBoxPropertiesCloseCurve
            // 
            checkBoxCloseCurve.AutoSize = true;
            checkBoxCloseCurve.Location = new Point(7, 4);
            checkBoxCloseCurve.Name = "checkBoxPropertiesCloseCurve";
            checkBoxCloseCurve.Size = new Size(89, 19);
            checkBoxCloseCurve.TabIndex = 49;
            checkBoxCloseCurve.Text = "Close Curve";
            checkBoxCloseCurve.UseVisualStyleBackColor = true;
            // 
            // SymbolCurve
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            Controls.Add(panelPropertiesPolygon);
            Name = "SymbolCurve";
            Size = new Size(170, 53);
            panelPropertiesPolygon.ResumeLayout(false);
            panelPropertiesPolygon.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)numericCurveTension).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private Panel panelPropertiesPolygon;
        private Label labelCurveTension;
        internal NumericUpDown numericCurveTension;
        internal CheckBox checkBoxCloseCurve;
    }
}
