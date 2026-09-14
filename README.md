# Minecraft Resource Importer

Minecraft Resource Importer is an Expo and React Native Android application that helps users import Minecraft Bedrock resource packages, add-ons, worlds, and templates into Minecraft.

The application uses the Android file-opening flow rather than the Android sharing flow. After a package is selected, it creates a temporary cache copy with the original extension, exposes it through an Android `content://` URI, grants temporary read access, and launches `ACTION_VIEW`. Android can then display compatible applications, including Minecraft, in the app resolver.

## Supported file formats

| Extension | Typical use |
| --- | --- |
| `.mcpack` | Resource packs, behavior packs, or skin packs |
| `.mcaddon` | Add-on packages |
| `.mcworld` | World packages |
| `.mctemplate` | World template packages |

## Features

- Android file selection restricted to supported Minecraft package formats.
- Android storage permission handling for supported Android versions.
- Temporary cache copy that preserves the selected filename and extension.
- FileProvider-backed `content://` URI for secure cross-application access.
- `ACTION_VIEW` import handoff with temporary read permission.
- Android app resolver flow for selecting Minecraft or another compatible application.
- Dark interface inspired by the supplied design reference.

## Requirements

| Requirement | Version or detail |
| --- | --- |
| Node.js | 22 or newer |
| pnpm | 9.12.0 |
| Expo | SDK 54 |
| Android build Java runtime | Java 17 |
| Android build target | Generated through Expo prebuild and Gradle |

## Local development

Install dependencies and start the Expo development server:

```bash
pnpm install
pnpm dev
```

The project includes a web preview through the Expo development command. Native Android behavior, including the FileProvider URI and app resolver, must be tested on an Android device or emulator.

## Validation

Run the available automated checks before submitting changes:

```bash
pnpm test
pnpm check
pnpm lint
```

The project intentionally does not use code comments in the application source files.

## Android release build

The repository includes the `Android APK Release` GitHub Actions workflow. It performs the following steps:

1. Installs the pinned pnpm and Node.js versions.
2. Installs project dependencies from the frozen lockfile.
3. Generates the native Android project with Expo prebuild.
4. Configures Java 17 and Gradle caching after the Android project exists.
5. Builds the release APK with Gradle stack traces enabled.
6. Creates a GitHub Release and uploads the generated APK.

To run the workflow manually:

1. Open the repository's **Actions** tab.
2. Select **Android APK Release**.
3. Select **Run workflow**.
4. Enter a unique release tag such as `v1.0.3`.
5. Download the APK from the resulting GitHub Release.

The generated APK is located at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

## Import flow

1. Tap the dashed file-selection area.
2. Select a file with a supported extension.
3. Tap **Import to Minecraft**.
4. Android opens the compatible-app resolver using `ACTION_VIEW`.
5. Select **Minecraft** to pass the package to the game.

If Minecraft does not appear, verify that Minecraft Bedrock is installed and that the selected file has one of the supported extensions. Device-specific Android and Minecraft versions may expose different resolver results.

## Project structure

| Path | Purpose |
| --- | --- |
| `app/(tabs)/index.tsx` | Main file selection and import screen |
| `lib/minecraft-package.ts` | Supported extensions and MIME type logic |
| `tests/minecraft-package.test.ts` | Package validation tests |
| `app.config.ts` | Expo and Android application configuration |
| `.github/workflows/android-release.yml` | Automated Android APK release workflow |
| `LICENSE` | MIT license text |

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE) for the complete license text.

## References

[1]: https://docs.expo.dev/versions/v54.0.0/sdk/document-picker/ "Expo DocumentPicker documentation"
[2]: https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/ "Expo FileSystem documentation"
[3]: https://developer.android.com/reference/android/content/Intent "Android Intent API reference"
[4]: https://developer.android.com/reference/androidx/core/content/FileProvider "AndroidX FileProvider reference"

The Android import implementation follows the secure URI-sharing model described by the Android platform documentation [3] [4].

## Disclaimer

Minecraft is a trademark of Mojang Studios. This project is an independent utility and is not affiliated with or endorsed by Mojang Studios or Microsoft.

Copyright (c) 2026 hoangvan200

The project is provided as-is without warranties of any kind. See [LICENSE](LICENSE) for the full terms.
