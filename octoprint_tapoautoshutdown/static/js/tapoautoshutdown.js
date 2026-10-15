function TapoAutoShutdownViewModel(parameters) {
    var self = this;

    self.onDataUpdaterPluginMessage = function (plugin, data) {
        if (plugin === "tapoautoshutdown" &&
            data.type === "bed_preheat") {
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
    };
}

OCTOPRINT_VIEWMODELS.push([
    TapoAutoShutdownViewModel,
    [],
    []
]);
