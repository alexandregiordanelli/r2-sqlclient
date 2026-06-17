# Installing on macOS

## Why "damaged" or "cannot be opened" error?

The R2 SQL Client app is **not code-signed or notarized** by Apple, so macOS Gatekeeper blocks it by default. This is normal for open-source apps without a paid Apple Developer account.

## Option 1: Remove Quarantine Attribute (Recommended)

After downloading the DMG, run these commands in Terminal:

```bash
# 1. Remove quarantine from DMG file
xattr -dr com.apple.quarantine ~/Downloads/R2\ SQL\ Client_0.1.0_aarch64.dmg

# 2. Mount the DMG
open ~/Downloads/R2\ SQL\ Client_0.1.0_aarch64.dmg

# 3. Remove quarantine from the app inside
xattr -cr /Volumes/R2\ SQL\ Client*/R2\ SQL\ Client.app

# 4. Copy to Applications
cp -R /Volumes/R2\ SQL\ Client*/R2\ SQL\ Client.app /Applications/

# 5. Open the app
open /Applications/R2\ SQL\ Client.app
```

## Option 2: Allow in System Settings

1. Try to open the app (it will fail with "damaged" error)
2. Go to **System Settings** → **Privacy & Security**
3. Scroll down to see "R2 SQL Client was blocked"
4. Click **"Open Anyway"**
5. Confirm by clicking **"Open"** in the dialog

## Option 3: Disable Gatekeeper Temporarily (Not Recommended)

```bash
# Disable Gatekeeper
sudo spctl --master-disable

# Open the app
open /Applications/R2\ SQL\ Client.app

# Re-enable Gatekeeper
sudo spctl --master-enable
```

## Building from Source (Most Secure)

If you prefer, build the app yourself:

```bash
git clone https://github.com/alexandregiordanelli/r2-sqlclient.git
cd r2-sqlclient
pnpm install
pnpm tauri build
```

The built app will be in `src-tauri/target/release/bundle/macos/R2 SQL Client.app`

## Why not sign the app?

Code signing requires:
- Apple Developer Program membership ($99/year)
- Certificate management
- Notarization workflow

For an open-source project, these costs and complexity aren't justified. macOS's security model assumes all unsigned apps are potentially harmful, but the code is fully auditable on GitHub.

## Verifying the Download

Check the SHA-256 hash matches the release page:

```bash
shasum -a 256 ~/Downloads/r2-sql-client_v1.0.0_universal.dmg
```

Compare with the hash on the [GitHub Release page](https://github.com/alexandregiordanelli/r2-sqlclient/releases/tag/v1.0.0).
