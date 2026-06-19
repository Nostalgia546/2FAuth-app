use tauri::{Manager, PhysicalSize, Size};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      #[cfg(desktop)]
      {
        if let Some(window) = app.get_webview_window("main") {
          if let Ok(Some(monitor)) = window.current_monitor() {
            let width = monitor.size().width;
            if width >= 2560 {
              let new_size = PhysicalSize::new(1500, 900);
              let _ = window.set_size(Size::Physical(new_size));
              let _ = window.center();
            } else {
              let _ = window.maximize();
            }
          }
        }
      }

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
