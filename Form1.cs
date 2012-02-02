using System;
using System.Linq;
using System.Windows.Forms;
using System.Text;
using System.IO;

namespace SrtTrans
{
    public partial class Form1 : Form
    {
        private string moviePath;
        private string traditionalConverted;
        private string simplifiedConverted;
        private string utf8converted;

        public Form1(string[] args)
        {
            InitializeComponent();

            if (args != null)
            {
                OpenFiles(args);
            }
        }

        [STAThread]
        static void Main(string[] args)
        {
            Application.Run(new Form1(args));
        }

        public void OpenFiles(Array a)
        {
            string sError = "";

            // process all files in array
            for (int i = 0; i < a.Length; i++)
            {
                string sFile = a.GetValue(i).ToString();

                FileInfo info = new FileInfo(sFile);

                if (!info.Exists)
                {
                    sError += "\nIncorrect file name: " + sFile;
                }
                else if (info.Name.ToLower().IndexOf(".srt") > -1)
                {
                    tbSubtitle.Text = info.Name;
                    ShowGuess(sFile);
                }
                else if (info.Name.ToLower().IndexOf(".mkv") > -1)
                {
                    tbMovie.Text = info.Name;
                    moviePath = info.FullName;
                }
            }

            if (sError.Length > 0)
                MessageBox.Show(this, sError, "Open File Error");
        }

        public void ShowGuess(string sFile)
        {
            byte[] bytes = File.ReadAllBytes(sFile);
            traditionalConverted = Encoding.GetEncoding(950).GetString(bytes);
            simplifiedConverted = Encoding.GetEncoding(936).GetString(bytes);
            utf8converted = Encoding.UTF8.GetString(bytes);

            AddTextPreview(lbTraditional, traditionalConverted);
            AddTextPreview(lbSimplified, simplifiedConverted);
            AddTextPreview(lbUTF8, utf8converted);
        }

        private static void AddTextPreview(ListBox lb, string str)
        {
            lb.Items.Clear();
            string[] lines = str.Split(new[] { Environment.NewLine }, StringSplitOptions.None);

            int i = 0;
            foreach (string s in lines.Where(t => !string.IsNullOrWhiteSpace(t) && !System.Text.RegularExpressions.Regex.IsMatch(t, @"^\d")))
            {
                if (i > 30)
                {
                    break;
                }

                lb.Items.Add(s);
                i++;
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {
            FileInfo movie = new FileInfo(moviePath);
            string srtPathName = movie.DirectoryName + @"\" + movie.Name.Replace(".mkv", ".srt");
            File.WriteAllText(srtPathName, traditionalConverted);
        }

        private void button3_Click(object sender, EventArgs e)
        {
            FileInfo movie = new FileInfo(moviePath);
            string srtPathName = movie.DirectoryName + @"\" + movie.Name.Replace(".mkv", ".srt");
            File.WriteAllText(srtPathName, utf8converted);
        }

        private void button1_Click(object sender, EventArgs e)
        {
            FileInfo movie = new FileInfo(moviePath);
            string srtPathName = movie.DirectoryName + @"\" + movie.Name.Replace(".mkv", ".srt");
            File.WriteAllText(srtPathName, Microsoft.VisualBasic.Strings.StrConv(simplifiedConverted, Microsoft.VisualBasic.VbStrConv.TraditionalChinese));
        }

        private void Form1_DragEnter(object sender, DragEventArgs e)
        {
            e.Effect = e.Data.GetDataPresent(DataFormats.FileDrop) ? DragDropEffects.Copy : DragDropEffects.None;
        }

        private void Form1_DragDrop(object sender, DragEventArgs e)
        {
            try
            {
                Array a = (Array)e.Data.GetData(DataFormats.FileDrop);

                if (a != null)
                {
                    this.BeginInvoke((Action)(() => OpenFiles(a)));
                    this.Activate();
                }
            }
            catch (Exception)
            {
            }
        }
    }
}
