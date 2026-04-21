namespace ScreenShotTool.Controls
{
    partial class SymbolShadows
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
            checkBoxShadow = new CheckBox();
            panel1.SuspendLayout();
            SuspendLayout();
            // 
            // panel1
            // 
            panel1.BorderStyle = BorderStyle.FixedSingle;
            panel1.Controls.Add(checkBoxShadow);
            panel1.Dock = DockStyle.Fill;
            panel1.Location = new Point(0, 0);
            panel1.Name = "panel1";
            panel1.Size = new Size(170, 24);
            panel1.TabIndex = 0;
            // 
            // checkBoxPropertiesShadow
            // 
            checkBoxShadow.AutoSize = true;
            checkBoxShadow.Location = new Point(3, 2);
            checkBoxShadow.Name = "checkBoxPropertiesShadow";
            checkBoxShadow.Size = new Size(68, 19);
            checkBoxShadow.TabIndex = 56;
            checkBoxShadow.Text = "Shadow";
            checkBoxShadow.UseVisualStyleBackColor = true;
            // 
            // SymbolShadows
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            Controls.Add(panel1);
            Name = "SymbolShadows";
            Size = new Size(170, 24);
            panel1.ResumeLayout(false);
            panel1.PerformLayout();
            ResumeLayout(false);
        }

        #endregion

        private Panel panel1;
        internal CheckBox checkBoxShadow;
    }
}
