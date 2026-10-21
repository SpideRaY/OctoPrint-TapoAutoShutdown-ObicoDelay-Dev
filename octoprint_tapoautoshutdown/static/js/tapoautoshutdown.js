
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

    // Clear the persistent green preheat box when OctoPrint reports that
    // the printer has disconnected, for example after the Tapo plug is off.
    // This only removes the notification; it does not control the printer.
    self.onEventDisconnected = function (payload) {
        if (bedPreheatNotification) {
            bedPreheatNotification.remove();
            bedPreheatNotification = null;
        }
    };

    // OctoPrint calls this when a plugin sends a message to the browser.
    // The Python backend must send matching data.type values for these cases
    // to run, and include the expected data fields (such as temperature/message).
    self.onDataUpdaterPluginMessage = function (plugin, data) {
        // Ignore messages from every other plugin.
        if (plugin !== "tapoautoshutdown") {
            return;
        }

        // LIGHT BAR REMINDER: shown before automatic bed preheating.
        // Show warning for 30 seconds to give the user time to turn it on.
        if (data.type === "light_bar_reminder") {
            new PNotify({
                title: "Tapo Auto Shutdown - Light Bar Reminder",
                text: "Have you turned your light bar on? " +
                    "It helps illuminate the printer for clearer " +
                    "video when rendering timelapses.",
                type: "warning",
                hide: true,
                delay: 30000,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }

        // PREHEAT STARTED: green/success notification.
        // The backend supplies the fixed 50°C target. This browser notice
        // is not a phone push notification.
        if (data.type === "bed_preheat") {
            if (bedPreheatNotification) {
                bedPreheatNotification.remove();
                bedPreheatNotification = null;
            }

            bedPreheatNotification = new PNotify({
                title: "Tapo Auto Shutdown",
                text: "Bed preheat requested. Target: " +
                    (data.temperature != null ? data.temperature : 50) + "°C.",
                type: "success",
                hide: true,
                delay: 60000,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }

        // PREHEAT COMPLETE: remove the start message, then show a notice
        // for 30 seconds.
        if (data.type === "bed_preheat_complete") {
            if (bedPreheatNotification) {
                bedPreheatNotification.remove();
                bedPreheatNotification = null;
            }

            bedPreheatCompleteNotification = new PNotify({
                title: "Tapo Auto Shutdown",
                text: "The bed has reached " +
                    (data.temperature != null ? data.temperature : 50) +
                    "°C. Ready to print!",
                type: "notice",
                hide: true,
                delay: 30000,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }

        // PREHEAT FAILED/TIMED OUT: remove the start message and show a
        // warning for 30 seconds. The backend may supply a specific message.
        if (data.type === "bed_preheat_failed") {
            if (bedPreheatNotification) {
                bedPreheatNotification.remove();
                bedPreheatNotification = null;
            }

            bedPreheatCompleteNotification = new PNotify({
                title: "Tapo Auto Shutdown",
                text: data.message ||
                    "Warning: Bed preheating timed out. Check the printer before printing.",
                type: "warning",
                hide: true,
                delay: 30000,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }

        // BED COOLING REMINDER: persistent notice at the reminder temperature.
        if (data.type === "bed_cooling_reminder") {
            bedCoolingReminder = new PNotify({
                title: "Tapo Auto Shutdown",
                text: "The bed is at " + data.temperature +
                    "°C or below — you may be able to remove your print.",
                type: "notice",
                hide: false,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }

        // SHUTDOWN WARNING: remove earlier cooling messages before the plug is switched off.
        if (data.type === "bed_cooling_shutdown_warning") {
            if (bedCoolingReminder) {
                bedCoolingReminder.remove();
                bedCoolingReminder = null;
            }
        
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

        // SHUTDOWN COMPLETE: remove earlier cooling messages and confirm shutdown.
        if (data.type === "bed_cooling_shutdown") {
            if (bedCoolingReminder) {
                bedCoolingReminder.remove();
                bedCoolingReminder = null;
            }

            if (bedCoolingShutdownWarning) {
                bedCoolingShutdownWarning.remove();
                bedCoolingShutdownWarning = null;
            }

            bedCoolingShutdown = new PNotify({
                title: "Tapo Auto Shutdown",
                text: "The bed has cooled to " +
                    data.temperature +
                    "°C. The printer has been switched off.",
                type: "success",
                hide: true,
                delay: 180000,
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
