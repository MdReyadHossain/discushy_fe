const WaveAnimation = () => {
    return (
        <svg width="80" height="60" viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="20" width="8" height="20" rx="3" fill="white">
                <animate attributeName="height" values="10;30;10" dur="1s" repeatCount="indefinite" />
                <animate attributeName="y" values="25;15;25" dur="1s" repeatCount="indefinite" />
            </rect>

            <rect x="36" y="15" width="8" height="30" rx="3" fill="white">
                <animate attributeName="height" values="15;40;15" dur="1s" begin="0.15s" repeatCount="indefinite" />
                <animate attributeName="y" values="22;10;22" dur="1s" begin="0.15s" repeatCount="indefinite" />
            </rect>

            <rect x="47" y="20" width="8" height="20" rx="3" fill="white">
                <animate attributeName="height" values="10;30;10" dur="1s" begin="0.3s" repeatCount="indefinite" />
                <animate attributeName="y" values="25;15;25" dur="1s" begin="0.3s" repeatCount="indefinite" />
            </rect>
        </svg>
    )
}

export default WaveAnimation
