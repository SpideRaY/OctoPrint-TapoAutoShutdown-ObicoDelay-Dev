
 // OctoPrint view model for notifications sent by the Tapo Auto Shutdown plugin.
 // This file displays messages from the Python backend; it does not control the
 // heater, read temperatures, or switch the Tapo plug off itself.
function TapoAutoShutdownViewModel(parameters) {
    var self = this;

    // Keep references to notifications that may need to be removed later.
    var bedPreheatNotification = null;
    var bedPreheatCompleteNotification = null;
    var bedCoolingReminder = null;
    var bedCoolingShutdownWarning = null;
    var bedCoolingShutdown = null;

    // OctoPrint calls this when a plugin sends a message to the browser.
    // The Python backend must send matching data.type values for these cases
    // to run, and include the expected data fields (such as temperature/message).
    self.onDataUpdaterPluginMessage = function (plugin, data) {
        // Ignore messages from every other plugin.
        if (plugin !== "tapoautoshutdown") {
            return;
        }

        // PREHEAT STARTED: persistent green/success notification.
        // It stays visible until the completion/failure event removes it.
        if (data.type === "bed_preheat") {
            bedPreheatNotification = new PNotify({
                title: "Tapo Auto Shutdown",
                text: "Bed preheat requested. Target: " +
                    data.temperature + "°C.",
                type: "success",
                hide: false,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }

        // PREHEAT COMPLETE: remove the persistent start message, then show
        // a notice for 3 minutes (180,000 milliseconds).
        if (data.type === "bed_preheat_complete") {
            // Close the original green preheat notification.
            if (bedPreheatNotification) {
                bedPreheatNotification.remove();
                bedPreheatNotification = null;
            }

            // Show the temperature-reached notice for 3 minutes.
            bedPreheatCompleteNotification = new PNotify({
                title: "Tapo Auto Shutdown",
                text: "Warning: The bed has reached " +
                    data.temperature + "°C. Ready to print!",
                type: "notice",
                hide: true,
                delay: 180000,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }

        // PREHEAT FAILED/TIMED OUT: remove the start message and show a
        // warning for 3 minutes. The backend may provide a specific message.
        if (data.type === "bed_preheat_failed") {
            // Close the original green preheat notification.
            if (bedPreheatNotification) {
                bedPreheatNotification.remove();
                bedPreheatNotification = null;
            }

            // Show the failure warning for 3 minutes.
            bedPreheatCompleteNotification = new PNotify({
                title: "Tapo Auto Shutdown",
                text: data.message ||
                    "Warning: Bed preheating timed out. Check the printer before printing.",
                type: "warning",
                hide: true,
                delay: 180000,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }

        // BED COOLING REMINDER: persistent notice when the backend reports
        // the reminder temperature (intended to prompt print removal).
        if (data.type === "bed_cooling_reminder") {
            bedCoolingReminder = new PNotify({
                title: "Tapo Auto Shutdown",
                text: "The bed is at " + data.temperature +
                    "°C — you may be able to remove your print.",
                type: "notice",
                hide: false,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }

        // SHUTDOWN WARNING: persistent error-style message before the plug
        // is switched off. The backend supplies the warning text.
        if (data.type === "bed_cooling_shutdown_warning") {
            bedCoolingShutdownWarning = new PNotify({
                title: "Tapo Auto Shutdown",
                text: data.message,
                type: "error",
                hide: false,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }

        // SHUTDOWN COMPLETE: remove the earlier cooling messages and show
        // a persistent confirmation. The backend reports the temperature
        // and should send this event only after switching off the printer plug.
        if (data.type === "bed_cooling_shutdown") {
            if (bedCoolingReminder) {
                bedCoolingReminder.remove();
                bedCoolingReminder = null;
            }

            if (bedCoolingShutdownWarning) {
                bedCoolingShutdownWarning.remove();
                bedCoolingShutdownWarning = null;
            }

            // This success notification intentionally stays visible.
            bedCoolingShutdown = new PNotify({
                title: "Tapo Auto Shutdown",
                text: "The bed has cooled to " +
                    data.temperature +
                    "°C. The printer has been switched off.",
                type: "success",
                hide: false,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }
    };
}

// Register this view model with OctoPrint so it can receive plugin messages.
OCTOPRINT_VIEWMODELS.push([
    TapoAutoShutdownViewModel,
    [],
    []
]);
