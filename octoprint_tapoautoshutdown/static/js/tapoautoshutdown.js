function TapoAutoShutdownViewModel(parameters) {
    var self = this;

    self.onDataUpdaterPluginMessage = function (plugin, data) {
        if (plugin !== "tapoautoshutdown") {
            return;
        }

        if (data.type === "bed_preheat") {
            new PNotify({
                title: "Tapo Auto Shutdown",
                text: "Bed preheat requested. Target: " +
                    data.temperature + "°C.",
                type: "success",
                hide: true,
                delay: 5000,
                modules: {
                    Animate: { animate: false },
                    Mobile: { swipeDismiss: false }
                }
            });
        }

        if (data.type === "bed_cooling_reminder") {
            new PNotify({
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
            new PNotify({
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
            new PNotify({
                title: "Tapo Auto Shutdown",
                text: "The bed has cooled to " +
                    data.temperature +
                    "°C. Switching off the printer.",
                type: "success",
                hide: true,
                delay: 6000,
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
