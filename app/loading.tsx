export default function Loading() {
    return (
        <div
            className="fixed left-0 right-0 top-0 z-[9999] h-0.5 overflow-hidden bg-transparent"
            aria-label="Loading"
            role="status"
        >
            <div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] bg-primary" />
        </div>
    );
}