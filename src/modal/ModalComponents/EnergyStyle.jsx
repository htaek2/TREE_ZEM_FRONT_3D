import styled from "styled-components";


export const Overlay = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;    
    transform: translate(-50%, -50%);

    display: flex;
    flex-direction: column; 

    width: 1024px;
    height: 768px;
    background: #1E1F22;
    z-index: 1000;
`;

export const ModalHeader = styled.div `
    display: flex;
    width: 100%;
    height: 30px;
    background: black;
    color: #FAFAFA;

    > div:first-child {
        width: 50%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: 8px 8px;
        gap: 4px;
    }
    > div:first-child img {
        display: block;
        width: 20px;
    }

    > div:last-child {
        width: 50%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 8px 8px;
    }
    > div:last-child img {
        display: block;
    }
`;

export const AverageAndEnergy = styled.div`
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    width: 228px;
    height: 660px;
    border-radius: 10px;
    border: 1px solid rgba(166, 166, 166, 0.2);
    background: #2B2D30;
    color: #FAFAFA;
    padding: 8px;
`;

export const AverageChargeMain = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 24px 0;
    width: 100%;
`;

export const AverageChargeMainL = styled.div`
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    width: 65%;
`;
export const AverageChargeMainR = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 35%;
`;

export const TodayTitle = styled.div`
    display: flex;
    font: 700 18px "나눔고딕";
    color: #FAFAFA;
`;
export const TodayValue = styled.div`
    font: 700 20px "나눔고딕";
    color: ${({ type }) =>
    type === "elect" ? "#F3C41F" :
    type === "gas" ? "#F9864E" :
    type === "water" ? "#00C0FF" : "#756DE5"};
`;
export const TodayRatio = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font: 700 10px "나눔고딕";
    color: #FAFAFA;
    gap: 4px;

    > div.ratio {
        color: ${({ ratio }) => ratio > 0 ? "#EF4444" : ratio < 0 ? "#445BEF" : "#FAFAFA"};
    }
`;
export const UpDownIcon = styled.div`
    display: flex;  

    > img {
        display: none;
    }
    ${({ ratio }) => ratio > 0 &&  `
        img.up {
            display: block;
        }
        img.down {
            display: none;
        }   
    `};
    ${({ ratio }) => ratio < 0 &&  `
        img.up {
            display: none;
        }
        img.down {
            display: block;
        }
        
    `};

`;

export const UpDownFont = styled.div`
    display: flex;
    color: #FAFAFA;

    > div {
        display: none;
    }

    ${({ ratio }) => ratio > 0 &&  `
        div:first-child {
            display: flex;
        }
        div:last-child {
            display: none;
        }   
    `};
    ${({ ratio }) => ratio < 0 &&  `
        div:first-child {
            display: none;
        }
        div:last-child {
            display: flex;
        }   
    `};
`;


export const AverageChargeFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;
export const AverageChargeFooterL = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font: 400 14px "나눔고딕";
    color: #FAFAFA;
    width: 55%;
    gap: 8px;

    > img {
        display: block;
        width: 8px;
        height: 8px;
    }
`;
export const AverageChargeFooterR = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font: 400 14px "나눔고딕";
    color: #FAFAFA;
    width: 45%;
    gap: 8px;
`;

export const Liner = styled.hr`
    border: 0;
    border-top: 2px solid rgba(166, 166, 166, 0.2); 
    width: calc(100% + 16px);   /* 좌우 padding 16px * 2 = 32px */
    margin: 16px 0px 8px -8px;
    height: 0;                   /* 높이 제거 */
`