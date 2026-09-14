import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as DocumentPicker from "expo-document-picker";
import * as IntentLauncher from "expo-intent-launcher";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { ScreenContainer } from "@/components/screen-container";
import { getMinecraftMimeType, hasSupportedExtension, supportedExtensions } from "@/lib/minecraft-package";

const pickerTypes = [
  "application/zip",
  "application/octet-stream",
  "application/x-zip-compressed",
  "application/x-minecraft-pack",
  "application/x-minecraft-addon",
  "application/x-minecraft-world",
  "application/x-minecraft-template",
];
const readPermission = "android.permission.READ_EXTERNAL_STORAGE";

type PermissionState = "checking" | "granted" | "denied";
type SelectedFile = {
  uri: string;
  name: string;
  mimeType?: string;
};

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const [permissionState, setPermissionState] = useState<PermissionState>("checking");
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [feedback, setFeedback] = useState("Choose a supported package to begin.");
  const [isImporting, setIsImporting] = useState(false);

  const needsLegacyPermission = useMemo(
    () => Platform.OS === "android" && Number(Platform.Version) < 33,
    [],
  );
  const canUsePicker = permissionState === "granted";
  const pickerHeight = Math.min(680, Math.max(390, height * 0.49));

  const requestStoragePermission = useCallback(async () => {
    if (!needsLegacyPermission) {
      setPermissionState("granted");
      return true;
    }

    const status = await PermissionsAndroid.request(readPermission, {
      title: "Storage access required",
      message: "Allow access to choose a Minecraft package from your device.",
      buttonPositive: "Allow",
      buttonNegative: "Not now",
    });
    const granted = status === PermissionsAndroid.RESULTS.GRANTED;
    setPermissionState(granted ? "granted" : "denied");
    if (!granted) {
      setFeedback("Storage access is required before choosing a package.");
    }
    return granted;
  }, [needsLegacyPermission]);

  const checkStoragePermission = useCallback(async () => {
    if (!needsLegacyPermission) {
      setPermissionState("granted");
      return;
    }

    const alreadyGranted = await PermissionsAndroid.check(readPermission);
    if (alreadyGranted) {
      setPermissionState("granted");
      return;
    }

    await requestStoragePermission();
  }, [needsLegacyPermission, requestStoragePermission]);

  useEffect(() => {
    void checkStoragePermission();
  }, [checkStoragePermission]);

  const handleChooseFile = useCallback(async () => {
    if (!canUsePicker) {
      await requestStoragePermission();
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: pickerTypes,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset || !hasSupportedExtension(asset.name)) {
        setSelectedFile(null);
        setFeedback("Unsupported file. Choose .mcpack, .mcaddon, .mcworld or .mctemplate.");
        return;
      }

      setSelectedFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType });
      setFeedback("File ready to import into Minecraft.");
    } catch {
      setFeedback("The file picker could not open. Please try again.");
    }
  }, [canUsePicker, requestStoragePermission]);

  const handleImport = useCallback(async () => {
    if (!selectedFile || !canUsePicker) return;

    setIsImporting(true);
    setFeedback("Opening Android app chooser…");
    const mimeType = getMinecraftMimeType(selectedFile);
    const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const localUri = `${FileSystem.cacheDirectory}minecraft-import-${Date.now()}-${safeName}`;

    try {
      if (Platform.OS === "android") {
        await FileSystem.copyAsync({ from: selectedFile.uri, to: localUri });
        const shareAvailable = await Sharing.isAvailableAsync();
        if (shareAvailable) {
          await Sharing.shareAsync(localUri, {
            mimeType: "application/octet-stream",
            dialogTitle: "Open with Minecraft",
          });
        } else {
          await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
            data: localUri,
            type: mimeType,
            flags: 1,
          });
        }
        setFeedback("Choose Minecraft in the Android app chooser.");
      } else {
        await Linking.openURL(selectedFile.uri);
        setFeedback("Package sent to Minecraft.");
      }
    } catch {
      try {
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: localUri,
          type: mimeType,
          flags: 1,
        });
        setFeedback("Choose Minecraft in the Android app chooser.");
      } catch {
        setFeedback("Minecraft could not open this package. Try selecting Minecraft from the chooser.");
      }
    } finally {
      setIsImporting(false);
    }
  }, [canUsePicker, selectedFile]);

  const borderText = selectedFile ? "Selected file:" : "Supported file formats:";
  const detailText = selectedFile ? selectedFile.name : ".mcpack .mcaddon .mcworld .mctemplate";

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brandLabel}>MINECRAFT UTILITIES</Text>
        </View>

        {permissionState === "denied" ? (
          <View style={styles.permissionCard}>
            <MaterialIcons name="lock-outline" size={20} color="#f4c76b" />
            <View style={styles.permissionCopy}>
              <Text style={styles.permissionTitle}>Storage access needed</Text>
              <Text style={styles.permissionMessage}>Allow file access to continue.</Text>
            </View>
            <Pressable onPress={() => void requestStoragePermission()} style={styles.permissionButton}>
              <Text style={styles.permissionButtonText}>Allow</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose Minecraft package"
          disabled={!canUsePicker}
          onPress={() => void handleChooseFile()}
          style={({ pressed }) => [
            styles.dropZone,
            { height: pickerHeight },
            !canUsePicker && styles.disabledZone,
            pressed && canUsePicker && styles.pressedZone,
          ]}
        >
          <View style={styles.dropZoneContent}>
            <View style={styles.uploadRow}>
              <MaterialIcons name={selectedFile ? "description" : "file-upload"} size={92} color="#a5a5a5" />
              <Text style={styles.chooseText}>{selectedFile ? "File selected" : "Choose file"}</Text>
            </View>
            <Text style={styles.supportedLabel}>{borderText}</Text>
            <Text style={styles.supportedFormats} numberOfLines={2} ellipsizeMode="middle">
              {detailText}
            </Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={selectedFile ? "Import to Minecraft" : "Please choose file"}
          disabled={!selectedFile || !canUsePicker || isImporting}
          onPress={() => void handleImport()}
          style={({ pressed }) => [
            styles.importButton,
            (!selectedFile || !canUsePicker || isImporting) && styles.disabledButton,
            pressed && selectedFile && styles.pressedButton,
          ]}
        >
          {isImporting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.importButtonText}>{selectedFile ? "Import to Minecraft" : "Please choose file"}</Text>
          )}
        </Pressable>

        <Text style={[styles.feedback, feedback.includes("required") && styles.feedbackWarning]}>{feedback}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    backgroundColor: "#242424",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8dcc67",
  },
  brandLabel: {
    color: "#8dcc67",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.8,
  },
  permissionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#6b5831",
    backgroundColor: "#332b1d",
  },
  permissionCopy: {
    flex: 1,
    gap: 2,
  },
  permissionTitle: {
    color: "#f6e0a9",
    fontSize: 13,
    fontWeight: "700",
  },
  permissionMessage: {
    color: "#cbb98c",
    fontSize: 12,
  },
  permissionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#d6a94e",
  },
  permissionButtonText: {
    color: "#241d10",
    fontSize: 12,
    fontWeight: "800",
  },
  dropZone: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: "#969696",
    borderRadius: 26,
    backgroundColor: "#242424",
  },
  dropZoneContent: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 78,
  },
  chooseText: {
    color: "#a5a5a5",
    fontSize: 34,
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  supportedLabel: {
    color: "#929292",
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
    marginBottom: 10,
  },
  supportedFormats: {
    maxWidth: "100%",
    color: "#a5a5a5",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  disabledZone: {
    opacity: 0.48,
  },
  pressedZone: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  importButton: {
    minHeight: 66,
    marginTop: 28,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#6cab4e",
  },
  disabledButton: {
    backgroundColor: "#777777",
    opacity: 0.8,
  },
  pressedButton: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  importButtonText: {
    color: "#f4f4f4",
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: 0.1,
    textAlign: "center",
  },
  feedback: {
    minHeight: 24,
    marginTop: 14,
    color: "#878787",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  feedbackWarning: {
    color: "#d6b46d",
  },
});
