using Microsoft.Win32;
using ScreenShotTool.Properties;
using System.Diagnostics;
using System.Runtime.Versioning;
using System.Text;

namespace ScreenShotTool.Classes;
[SupportedOSPlatform("windows")]



public class SettingsRegistry
{
    readonly static string RegKeyName = @"SOFTWARE\ScreenshotTool";
    readonly static string[] settingStrings = ["Foldername", "Filename", "FileExtension", "StickerFolder", "StartHidden", "MinimizeOnClose", "Counter"];

    public static bool LoadSettingsFromRegistry()
    {
        RegistryKey? RegKey = Registry.CurrentUser.OpenSubKey(RegKeyName);
        Debug.WriteLine("Loading fallback values from registry");
        if (RegKey == null)
        {
            Debug.WriteLine("RegKey is null");
            return false;
        }

        foreach (string settingString in settingStrings)
        {
            LoadSettingFromRegistry(RegKey, settingString);
        }

        foreach (string hotkey in MainForm.HotkeyNames)
        {
            string? v = RegKey.GetValue(hotkey)?.ToString();
            if (v != null)
            {
                (string key, bool Ctrl, bool Alt, bool Shift, bool Win) = HotkeyFromRegistryString(v);
                Settings.Default["hk" + hotkey + "Key"] = key;
                Settings.Default["hk" + hotkey + "Ctrl"] = Ctrl;
                Settings.Default["hk" + hotkey + "Alt"] = Alt;
                Settings.Default["hk" + hotkey + "Shift"] = Shift;
                Settings.Default["hk" + hotkey + "Win"] = Win;
            }
        }

        RegKey.Dispose();
        return true;
    }

    private static void LoadSettingFromRegistry(RegistryKey key, string name)
    {
        object? value = key.GetValue(name);
        if (value != null)
        {
            if (value is string || value is bool || value is int)
            {
                try
                {
                    Debug.WriteLine($"Applying setting '{name}' from registry: {value}");

                    string? valueAsString = value.ToString();

                    if (valueAsString != null)
                    {
                        if (valueAsString == "True" || valueAsString == "False")
                        {
                            value = bool.Parse(valueAsString);
                        }
                    }
                    Settings.Default[name] = value;
                }
                catch
                {
                    Debug.WriteLine($"ApplySettingFromRegistry: Setting '{name}' does not exist");
                }
            }
        }
        else
        {
            Debug.WriteLine($"The setting '{name}' does not exist in the registry");
        }
    }

    private static void SaveSettingToRegistry(RegistryKey key, string name)
    {
        object? value;
        try
        {
            value = Settings.Default[name];
        }
        catch
        {
            Debug.WriteLine($"SaveSettingToRegistry: Setting '{name}' does not exist");
            return;
        }

        if (value != null)
        {
            if (value is string || value is bool || value is int)
            {
                Debug.WriteLine($"Saving setting '{name}' to registry: {value}");
                key.SetValue(name, value);
            }
            else
            {
                Debug.WriteLine($"Can't save '{name}' to registry, type is not allowed");
            }
        }
    }

    public static void SaveSettingsToRegistry()
    {
        RegistryKey RegKey = Registry.CurrentUser.CreateSubKey(RegKeyName);
        Debug.WriteLine("Saving fallback values to registry");
        if (RegKey == null)
        {
            Debug.WriteLine("RegKey is null");
            return;
        }
        Debug.WriteLine("Writing to registry, foldername: " + Settings.Default.Foldername);
        foreach (string settingString in settingStrings)
        {
            SaveSettingToRegistry(RegKey, settingString);
        }

        foreach (string hotkey in MainForm.HotkeyNames)
        {
            string v = HotkeyToRegistryString(
                Settings.Default["hk" + hotkey + "Key"].ToString() + "",
                bool.Parse(Settings.Default["hk" + hotkey + "Ctrl"].ToString() + ""),
                bool.Parse(Settings.Default["hk" + hotkey + "Alt"].ToString() + ""),
                bool.Parse(Settings.Default["hk" + hotkey + "Shift"].ToString() + ""),
                bool.Parse(Settings.Default["hk" + hotkey + "Win"].ToString() + "")
                );
            Debug.WriteLine($"Setting key {hotkey} to {v}");
            RegKey.SetValue(hotkey, v);
        }

        RegKey.Close();
        RegKey.Dispose();
    }

    private static string HotkeyToRegistryString(string hotkeyKey, bool Ctrl, bool Alt, bool Shift, bool Win)
    {
        StringBuilder keyValue = new();
        keyValue.Append(Ctrl ? "1" : "0");
        keyValue.Append(Alt ? "1" : "0");
        keyValue.Append(Shift ? "1" : "0");
        keyValue.Append(Win ? "1" : "0");
        keyValue.Append(' ');
        keyValue.Append(hotkeyKey);
        return keyValue.ToString();
    }

    private static (string hotkeyKey, bool Ctrl, bool Alt, bool Shift, bool Win) HotkeyFromRegistryString(string RegistryString)
    {
        if (RegistryString.Length < 6) return ("", false, false, false, false);

        bool Ctrl = RegistryString[0] == '1';
        bool Alt = RegistryString[1] == '1';
        bool Shift = RegistryString[2] == '1';
        bool Win = RegistryString[3] == '1';
        string key = RegistryString[5..];
        return (key, Ctrl, Alt, Shift, Win);
    }
}
