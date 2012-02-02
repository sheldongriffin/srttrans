using System.Windows.Forms;

namespace SrtTrans
{
    partial class Form1
    {
        private ListBox lbTraditional;
        private ListBox lbSimplified;
        private Button button1;
        private Button button2;
        private Label label1;
        private Label label2;
        private TextBox tbMovie;
        private TextBox tbSubtitle;
        private Button button3;
        private ListBox lbUTF8;

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
            this.lbSimplified = new System.Windows.Forms.ListBox();
            this.lbTraditional = new System.Windows.Forms.ListBox();
            this.button1 = new System.Windows.Forms.Button();
            this.button2 = new System.Windows.Forms.Button();
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.tbMovie = new System.Windows.Forms.TextBox();
            this.tbSubtitle = new System.Windows.Forms.TextBox();
            this.button3 = new System.Windows.Forms.Button();
            this.lbUTF8 = new System.Windows.Forms.ListBox();
            this.SuspendLayout();
            // 
            // lbSimplified
            // 
            this.lbSimplified.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.lbSimplified.Location = new System.Drawing.Point(6, 60);
            this.lbSimplified.Name = "lbSimplified";
            this.lbSimplified.Size = new System.Drawing.Size(246, 316);
            this.lbSimplified.TabIndex = 0;
            // 
            // lbTraditional
            // 
            this.lbTraditional.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.lbTraditional.FormattingEnabled = true;
            this.lbTraditional.Location = new System.Drawing.Point(258, 60);
            this.lbTraditional.Name = "lbTraditional";
            this.lbTraditional.Size = new System.Drawing.Size(246, 316);
            this.lbTraditional.TabIndex = 3;
            // 
            // button1
            // 
            this.button1.Font = new System.Drawing.Font("Arial", 12F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.button1.Location = new System.Drawing.Point(87, 382);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(75, 35);
            this.button1.TabIndex = 6;
            this.button1.Text = "简体";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // button2
            // 
            this.button2.Font = new System.Drawing.Font("Arial", 12F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.button2.Location = new System.Drawing.Point(332, 382);
            this.button2.Name = "button2";
            this.button2.Size = new System.Drawing.Size(75, 35);
            this.button2.TabIndex = 7;
            this.button2.Text = "繁体";
            this.button2.UseVisualStyleBackColor = true;
            this.button2.Click += new System.EventHandler(this.button2_Click);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(12, 11);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(47, 13);
            this.label1.TabIndex = 8;
            this.label1.Text = "Subtitles";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(12, 37);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(36, 13);
            this.label2.TabIndex = 9;
            this.label2.Text = "Movie";
            // 
            // tbMovie
            // 
            this.tbMovie.Location = new System.Drawing.Point(98, 34);
            this.tbMovie.Name = "tbMovie";
            this.tbMovie.Size = new System.Drawing.Size(559, 20);
            this.tbMovie.TabIndex = 10;
            // 
            // tbSubtitle
            // 
            this.tbSubtitle.Location = new System.Drawing.Point(98, 8);
            this.tbSubtitle.Name = "tbSubtitle";
            this.tbSubtitle.Size = new System.Drawing.Size(559, 20);
            this.tbSubtitle.TabIndex = 11;
            // 
            // button3
            // 
            this.button3.Font = new System.Drawing.Font("Arial", 12F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.button3.Location = new System.Drawing.Point(593, 382);
            this.button3.Name = "button3";
            this.button3.Size = new System.Drawing.Size(75, 35);
            this.button3.TabIndex = 13;
            this.button3.Text = "UTF8";
            this.button3.UseVisualStyleBackColor = true;
            this.button3.Click += new System.EventHandler(this.button3_Click);
            // 
            // lbUTF8
            // 
            this.lbUTF8.FormattingEnabled = true;
            this.lbUTF8.Location = new System.Drawing.Point(510, 60);
            this.lbUTF8.Name = "lbUTF8";
            this.lbUTF8.Size = new System.Drawing.Size(246, 316);
            this.lbUTF8.TabIndex = 12;
            // 
            // Form1
            // 
            this.AllowDrop = true;
            this.AutoScaleBaseSize = new System.Drawing.Size(5, 13);
            this.ClientSize = new System.Drawing.Size(766, 426);
            this.Controls.Add(this.button3);
            this.Controls.Add(this.lbUTF8);
            this.Controls.Add(this.tbSubtitle);
            this.Controls.Add(this.tbMovie);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.button2);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.lbTraditional);
            this.Controls.Add(this.lbSimplified);
            this.Name = "Form1";
            this.Text = "Drop Files Demo";
            this.DragDrop += new System.Windows.Forms.DragEventHandler(this.Form1_DragDrop);
            this.DragEnter += new System.Windows.Forms.DragEventHandler(this.Form1_DragEnter);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
    }
}