function TapoAutoShutdownViewModel(parameters) {
    var self = this;
    var bedPreheatNotification = null;
    var bedPreheatCompleteNotification = null;    
    var bedCoolingReminder = null;
    var bedCoolingShutdownWarning = null;
    var bedCoolingShutdown = null;
    
    self.onDataUpdaterPluginMessage = function (plugin, data) {
        if (plugin !== "tapoautoshutdown") {
            return;
        }

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

        if (data.type === "bed_preheat_complete") {

            // Close the original green preheat notification
            if (bedPreheatNotification) {
                bedPreheatNotification.remove();
                bedPreheatNotification = null;
            }

            // Show the temperature-reached warning for 3 minutes
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
                delay: 180000,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }

        if (data.type === "bed_cooling_reminder") {
            bedCoolingReminder = new PNotify({
                title: "Tapo Auto Shutdown",
                text: "The bed is at " + data.temperature +
                    "°C — try removing your print. " +
                    "The printer will switch off automatically " +
                    "when the bed reaches 30°C.",
                type: "notice",
                hide: false,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }

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

        if (data.type === "bed_cooling_shutdown") {
            bedCoolingShutdown = new PNotify({
                title: "Tapo Auto Shutdown",
                text: "The bed has cooled to " +
                    data.temperature +
                    "°C. Switching off the printer.",
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

OCTOPRINT_VIEWMODELS.push([
    TapoAutoShutdownViewModel,
    [],
    []
]);
