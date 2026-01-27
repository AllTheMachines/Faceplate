import React from 'react'
import { WindowChromeElementConfig } from '../../../../types/elements'

interface WindowChromeRendererProps {
  config: WindowChromeElementConfig
}

/**
 * Window Chrome Renderer - Title bar with OS-specific button styles
 * Supports macOS traffic lights, Windows icons, and neutral circles
 */
export function WindowChromeRenderer({ config }: WindowChromeRendererProps) {
  const hasChildren = config.children && config.children.length > 0

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: config.backgroundColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    userSelect: 'none',
    position: 'relative',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: `${config.titleFontSize}px`,
    fontFamily: config.fontFamily,
    fontWeight: config.fontWeight,
    color: config.titleColor,
    textAlign: 'center',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }

  // Button styles based on OS variant
  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: config.buttonStyle === 'macos' ? '8px' : '0px',
    alignItems: 'center',
  }

  // Render macOS traffic light buttons
  const renderMacOSButtons = () => {
    const macOSButtonStyle: React.CSSProperties = {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    }

    return (
      <>
        {config.showCloseButton && (
          <div style={{ ...macOSButtonStyle, backgroundColor: '#ff5f57' }} />
        )}
        {config.showMinimizeButton && (
          <div style={{ ...macOSButtonStyle, backgroundColor: '#febc2e' }} />
        )}
        {config.showMaximizeButton && (
          <div style={{ ...macOSButtonStyle, backgroundColor: '#28c840' }} />
        )}
      </>
    )
  }

  // Render Windows icon buttons
  const renderWindowsButtons = () => {
    const windowsButtonStyle: React.CSSProperties = {
      width: '46px',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: 'none',
      color: config.titleColor,
      fontSize: '10px',
      transition: 'background-color 0.15s',
    }

    const closeButtonStyle: React.CSSProperties = {
      ...windowsButtonStyle,
    }

    // Windows-style minimize icon (horizontal line)
    const MinimizeIcon = () => (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="0" y="4" width="10" height="1" fill="currentColor" />
      </svg>
    )

    // Windows-style maximize icon (square)
    const MaximizeIcon = () => (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="0" y="0" width="10" height="10" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
    )

    // Windows-style close icon (X)
    const CloseIcon = () => (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M0 0 L10 10 M10 0 L0 10" stroke="currentColor" strokeWidth="1" />
      </svg>
    )

    return (
      <>
        {config.showMinimizeButton && (
          <div style={windowsButtonStyle}>
            <MinimizeIcon />
          </div>
        )}
        {config.showMaximizeButton && (
          <div style={windowsButtonStyle}>
            <MaximizeIcon />
          </div>
        )}
        {config.showCloseButton && (
          <div style={closeButtonStyle}>
            <CloseIcon />
          </div>
        )}
      </>
    )
  }

  // Render neutral circular buttons
  const renderNeutralButtons = () => {
    const neutralButtonStyle: React.CSSProperties = {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: '#666666',
      border: '1px solid #999999',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    }

    const neutralGap: React.CSSProperties = {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    }

    return (
      <div style={neutralGap}>
        {config.showMinimizeButton && <div style={neutralButtonStyle} />}
        {config.showMaximizeButton && <div style={neutralButtonStyle} />}
        {config.showCloseButton && <div style={neutralButtonStyle} />}
      </div>
    )
  }

  // Determine button layout: macOS on left, others on right
  const buttonsOnLeft = config.buttonStyle === 'macos'

  return (
    <div style={containerStyle}>
      {buttonsOnLeft && (
        <div style={buttonContainerStyle}>
          {renderMacOSButtons()}
        </div>
      )}

      {config.showTitle && (
        <div style={titleStyle}>{config.titleText}</div>
      )}

      {!buttonsOnLeft && (
        <div style={buttonContainerStyle}>
          {config.buttonStyle === 'windows' ? renderWindowsButtons() : renderNeutralButtons()}
        </div>
      )}

      {hasChildren && (
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            pointerEvents: 'none',
          }}
        >
          {config.children!.length} item{config.children!.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
