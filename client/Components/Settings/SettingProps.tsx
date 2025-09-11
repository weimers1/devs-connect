{
    /*InterFace for Interactivity With SideBar */
}
interface SettingSidebarProps {
    activeSection: string | undefined;
    onSelectionClick: (sectionId: string) => void;
}

export default SettingSidebarProps;
