# Nombre del Proyecto

Aplicación móvil desarrollada con React Native, enfocada en la plataforma Android.

---

## 🧰 Entorno de desarrollo

- **Android Studio**: 2024.3.1 Patch 1  
  Runtime version: 21.0.5+-13047016-b750
- **Node.js**: 22.14.0
- **npm**: 10.9.2
- **React Native**: 0.79.1
- **React Native CLI**: 18.0.0
- **Java (JDK)**: OpenJDK 17.0.14+7 (Temurin)

---

## 📱 Cómo ejecutar la aplicación en Android

### ✅ Requisitos previos

Asegúrate de tener instalado y correctamente configurado:

- **Android Studio** con emulador **Android 15.0 (Vanilla)** o dispositivo físico conectado.  
  > *Recomendación*: crea el AVD desde **Device Manager → Create Device → Pixel 6 → Android 15.0 (Vanilla)**.

- **JDK 17**

- **Node.js** y **npm**

- **React Native CLI**  
  ```bash
  npm install -g react-native-cli
  ```

- **Variables de entorno para el SDK de Android**  
  Añade lo siguiente a tu `~/.bashrc`, `~/.zshrc` o equivalente y recarga la shell:

  ```bash
  # Android SDK
  export ANDROID_HOME="$HOME/Android/Sdk"
  export ANDROID_SDK_ROOT="$ANDROID_HOME"

  # Añade las herramientas al PATH
  export PATH="$PATH:$ANDROID_HOME/emulator"
  export PATH="$PATH:$ANDROID_HOME/tools"
  export PATH="$PATH:$ANDROID_HOME/tools/bin"
  export PATH="$PATH:$ANDROID_HOME/platform-tools"
  ```

---

### 🚀 Pasos para ejecutar

1. Clona el repositorio:
   ```bash
   git clone https://github.com/usuario/tu-repo.git
   cd tu-repo
   ```

2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Inicia el emulador **Android 15.0 (Vanilla)** o conecta un dispositivo físico.

4. Habilita la conexión con los puertos locales:
   ```bash
   adb reverse tcp:8081 tcp:8081   # Metro Bundler
   adb reverse tcp:8080 tcp:8080   # Backend local (EM si aplica)
   ```

5. Inicia Metro Bundler:
   ```bash
   npm start
   ```

6. En otra terminal, compila y lanza la app en Android:
   ```bash
   npm run android
   ```

---

### 🛠️ Notas adicionales

- Comprueba que tu dispositivo o emulador esté visible:
  ```bash
  adb devices
  ```
- Si Metro Bundler muestra errores de caché, reinícialo:
  ```bash
  npm start -- --reset-cache
  ```
- Android Studio puede descargar componentes adicionales (NDK, SDK Tools) la primera vez que compiles el proyecto.

---

