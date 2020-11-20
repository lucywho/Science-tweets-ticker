$.ajax({
    url: "/data.json",
    method: "GET",
    success: function(links) {
        var myHtml = "";
        for (var i = 0; i < links.length; i++) {
            var content =
                "<a href=" +
                links[i].url +
                " " +
                "target='_blank' >" +
                links[i].text +
                "</a>";
            myHtml += content;
        }

        $("#headlines").html(myHtml);

        var left = $("#headlines").offset().left;

        var anim;

        anim = requestAnimationFrame(moveHeadlines);

        $("#headlines a").on("mouseover", function mouseOn(event) {
            $(event.target).css({
                color: "#db5461",
                textDecoration: "underline",
            });
            cancelAnimationFrame(anim);
        });

        $("#headlines a").on("mouseout", function mouseOut(event) {
            $(event.target).css({
                color: "#6b5e62",
                textDecoration: "none",
            });
            moveHeadlines();
        });

        function moveHeadlines() {
            left--;

            if (
                left <
                -$("#headlines a")
                    .eq(0)
                    .innerWidth()
            ) {
                // add width of first link to new left
                left += $("#headlines a")
                    .eq(0)
                    .innerWidth();
                //make the first link the last link
                $("#headlines a")
                    .eq(0)
                    .parent()
                    .append($("#headlines a").eq(0));
            }

            $("#headlines").css({
                left: left + "px",
            });
            anim = requestAnimationFrame(moveHeadlines);
        }
    },

    error: function(err) {
        console.log("error");
        return;
    },
});
