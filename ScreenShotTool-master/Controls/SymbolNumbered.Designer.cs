namespace ScreenShotTool.Controls
{
    partial class SymbolNumbered
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
            label1 = new Label();
            NumberText = new TextBox();
            checkBoxAuto = new CheckBox();
            panel1.SuspendLayout();
            SuspendLayout();
            // 
            // panel1
            // 
            panel1.BorderStyle = BorderStyle.FixedSingle;
            panel1.Controls.Add(label1);
            panel1.Controls.Add(NumberText);
            panel1.Controls.Add(checkBoxAuto);
            panel1.Dock = DockStyle.Fill;
            panel1.Location = new Point(0, 0);
            panel1.Name = "panel1";
            panel1.Size = new Size(170, 56);
            panel1.TabIndex = 0;
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(3, 31);
            label1.Name = "label1";
            label1.Size = new Size(28, 15);
            label1.TabIndex = 2;
            label1.Text = "Text";
            // 
            // NumberText
            // 
            NumberText.Location = new Point(37, 28);
            NumberText.Name = "NumberText";
            NumberText.Size = new Size(124, 23);
            NumberText.TabIndex = 1;
            // 
            // checkBoxAuto
            // 
            checkBoxAuto.AutoSize = true;
            checkBoxAuto.Location = new Point(7, 4);
            checkBoxAuto.Name = "checkBoxAuto";
            checkBoxAuto.Size = new Size(99, 19);
            checkBoxAuto.TabIndex = 0;
            checkBoxAuto.Text = "Auto Number";
            checkBoxAuto.UseVisualStyleBackColor = true;
            // 
            // SymbolNumbered
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            Controls.Add(panel1);
            Name = "SymbolNumbered";
            Size = new Size(170, 56);
            panel1.ResumeLayout(false);
            panel1.PerformLayout();
            ResumeLayout(false);
        }

        #endregion

        private Panel panel1;
        internal CheckBox checkBoxAuto;
        internal TextBox NumberText;
        private Label label1;
    }
}
