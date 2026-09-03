// Student links restrict only the other practice page; theory and tools stay open.
const studentNavigationParams = new URLSearchParams(window.location.search);
const studentNavigationActive = studentNavigationParams.has("student") || studentNavigationParams.has("s");
const currentPracticePage = location.pathname.endsWith("notes.html") ? "hear"
    : location.pathname.endsWith("index.html") ? "observe"
    : studentNavigationParams.get("source");

function studentDestination(link){
    const url = new URL(link.href, location.href);
    url.search = "";
    url.searchParams.set("student", "1");
    if(currentPracticePage) url.searchParams.set("source", currentPracticePage);
    ["config", "s"].forEach((name) => {
        const value = studentNavigationParams.get(name);
        if(value) url.searchParams.set(name, value);
    });
    return url;
}

function updateStudentNavigation(){
    if(!studentNavigationActive || !currentPracticePage) return;
    document.body.classList.add("student-navigation-active");
    document.querySelectorAll(".subtitle-link").forEach(link => {
        const destination = studentDestination(link);
        const isObserve = destination.pathname.endsWith("index.html");
        const isHear = destination.pathname.endsWith("notes.html");
        const isOtherPracticePage = (currentPracticePage === "observe" && isHear) || (currentPracticePage === "hear" && isObserve);
        if(isOtherPracticePage){
            link.setAttribute("aria-disabled", "true");
            link.setAttribute("tabindex", "-1");
            link.dataset.studentBlocked = "true";
        }else{
            link.href = destination.href;
            link.removeAttribute("aria-disabled");
            link.removeAttribute("tabindex");
            delete link.dataset.studentBlocked;
        }
    });
}

document.addEventListener("click", event => {
    const link = event.target.closest(".subtitle-link[data-student-blocked]");
    if(link) event.preventDefault();
}, true);

updateStudentNavigation();
