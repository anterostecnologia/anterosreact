export const SearchWrapper = styled.div`
    position: absolute;
    top: 4px;
    right: 20px;

    background-color: ${props => props.theme.bgColorLight};
    color: ${props => props.theme.fgColorDark};

    padding: 8px;
    border: 1px solid ${props => props.theme.borderColor};

    font-size: 13px;

    transform: translateX(${props => (props.showSearch ? 0 : 400)}px);
    transition: transform 0.15s;

    .search-bar-inner {
        display: flex;
    }

    .search-status {
        margin-top: 4px;
        font-size: 11px;
    }

    .search-progress {
        position: absolute;
        height: 4px;
        left: 0;
        bottom: 0;

        background-color: ${props => props.theme.fgColorLight};
    }

    input {
        width: 220px;
        color: ${props => props.theme.fgColorDark};
        border: none;
        border-width: 0;
        outline: none;
    }

    button {
        width: 24px;
        height: 24px;
        padding: 0;

        border: none;
        outline: none;
        background: none;

        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        color: ${props => props.theme.fgColorMedium};

        :hover {
            color: ${props => props.theme.fgColorDark};
        }

        .button-icon {
            width: 16px;
            height: 16px;
        }

        :disabled {
            ${disabledProps}
        }
    }
`;