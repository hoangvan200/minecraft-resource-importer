# Minecraft Resource Importer

Ứng dụng Expo/React Native hỗ trợ chọn gói tài nguyên Minecraft và mở trực tiếp bằng Minecraft trên Android.

## Định dạng hỗ trợ

- `.mcpack`
- `.mcaddon`
- `.mcworld`
- `.mctemplate`

## Chạy dự án

```bash
pnpm install
pnpm dev
```

## Build APK

Workflow GitHub Actions `Android APK Release` sẽ tạo Android project, build APK release và đính kèm APK vào GitHub Release. Có thể chạy workflow thủ công trong tab Actions và nhập release tag.

Khi nhấn import trên Android, ứng dụng tạo bản sao tạm thời giữ nguyên phần mở rộng, mở Android app chooser và cấp quyền đọc URI cho ứng dụng được chọn. Chọn Minecraft để bắt đầu import.
