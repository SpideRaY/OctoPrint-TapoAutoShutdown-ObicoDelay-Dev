$(function () {
    function showPreheatNotification(temperature) {
        new PNotify({
            title: "Tapo Auto Shutdown",
            text: "Bed preheat requested. Target: " +
                temperature + "°C.",
            type: "success",
            hide: true,
            delay: 5000
        });
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: function () {},
        onDataUpdaterPluginMessage: function (plugin, data) {
            if (plugin === "tapoautoshutdown" &&
                data.type === "bed_preheat") {
                showPreheatNotification(data.temperature);
            }
        }
    });
});
