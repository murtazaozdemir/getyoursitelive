namespace ScreenShotTool.Forms
{
    partial class NewImagePrompt
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
            numericWidth = new NumericUpDown();
            label1 = new Label();
            label2 = new Label();
            numericHeight = new NumericUpDown();
            label3 = new Label();
            buttonColor = new Button();
            colorDialog1 = new ColorDialog();
            buttonOK = new Button();
            buttonCancel = new Button();
            ((System.ComponentModel.ISupportInitialize)numericWidth).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericHeight).BeginInit();
            SuspendLayout();
            // 
            // numericWidth
            // 
            numericWidth.Location = new Point(57, 17);
            numericWidth.Maximum = new decimal(new int[] { 5000, 0, 0, 0 });
            numericWidth.Minimum = new decimal(new int[] { 16, 0, 0, 0 });
            numericWidth.Name = "numericWidth";
            numericWidth.Size = new Size(63, 23);
            numericWidth.TabIndex = 0;
            numericWidth.Value = new decimal(new int[] { 500, 0, 0, 0 });
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(12, 19);
            label1.Name = "label1";
            label1.Size = new Size(39, 15);
            label1.TabIndex = 1;
            label1.Text = "Width";
            // 
            // label2
            // 
            label2.AutoSize = true;
            label2.Location = new Point(12, 46);
            label2.Name = "label2";
            label2.Size = new Size(43, 15);
            label2.TabIndex = 3;
            label2.Text = "Height";
            // 
            // numericHeight
            // 
            numericHeight.Location = new Point(57, 44);
            numericHeight.Maximum = new decimal(new int[] { 5000, 0, 0, 0 });
            numericHeight.Minimum = new decimal(new int[] { 16, 0, 0, 0 });
            numericHeight.Name = "numericHeight";
            numericHeight.Size = new Size(63, 23);
            numericHeight.TabIndex = 2;
            numericHeight.Value = new decimal(new int[] { 500, 0, 0, 0 });
            // 
            // label3
            // 
            label3.AutoSize = true;
            label3.Location = new Point(17, 81);
            label3.Name = "label3";
            label3.Size = new Size(103, 15);
            label3.TabIndex = 4;
            label3.Text = "Background Color";
            // 
            // buttonColor
            // 
            buttonColor.BackColor = Color.White;
            buttonColor.FlatStyle = FlatStyle.Flat;
            buttonColor.Location = new Point(17, 99);
            buttonColor.Name = "buttonColor";
            buttonColor.Size = new Size(103, 24);
            buttonColor.TabIndex = 5;
            buttonColor.UseVisualStyleBackColor = false;
            buttonColor.Click += SelectColor_Click;
            // 
            // buttonOK
            // 
            buttonOK.Location = new Point(87, 144);
            buttonOK.Name = "buttonOK";
            buttonOK.Size = new Size(75, 23);
            buttonOK.TabIndex = 6;
            buttonOK.Text = "OK";
            buttonOK.UseVisualStyleBackColor = true;
            buttonOK.Click += ButtonOK_Click;
            // 
            // buttonCancel
            // 
            buttonCancel.Location = new Point(6, 144);
            buttonCancel.Name = "buttonCancel";
            buttonCancel.Size = new Size(75, 23);
            buttonCancel.TabIndex = 7;
            buttonCancel.Text = "Cancel";
            buttonCancel.UseVisualStyleBackColor = true;
            buttonCancel.Click += ButtonCancel_Click;
            // 
            // NewImagePrompt
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(169, 172);
            Controls.Add(buttonCancel);
            Controls.Add(buttonOK);
            Controls.Add(buttonColor);
            Controls.Add(label3);
            Controls.Add(label2);
            Controls.Add(numericHeight);
            Controls.Add(label1);
            Controls.Add(numericWidth);
            FormBorderStyle = FormBorderStyle.FixedToolWindow;
            Name = "NewImagePrompt";
            Text = "Create new image";
            ((System.ComponentModel.ISupportInitialize)numericWidth).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericHeight).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private NumericUpDown numericWidth;
        private Label label1;
        private Label label2;
        private NumericUpDown numericHeight;
        private Label label3;
        private Button buttonColor;
        private ColorDialog colorDialog1;
        private Button buttonOK;
        private Button buttonCancel;
    }
}