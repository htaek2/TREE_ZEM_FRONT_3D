import styled, { keyframes, css } from 'styled-components';



// 스타일 컴포넌트들
const PanelWrapper = styled.div`
  position: absolute;
  bottom: 50px;
  right: 5%;
  min-width: 320px;
`;

const PanelContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.08),
    0 2px 10px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.5);
`;

const PanelHeader = styled.div`
  background: linear-gradient(135deg, #646666ff 0%, #000000ff 100%);
  padding: 18px 24px;
  position: relative;
  overflow: hidden;
  

`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: white;
  letter-spacing: -0.5px;
`;

const CloseIcon = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
  

`;

const CategoryTag = styled.div`
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 400;
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
`;

const ContentBody = styled.div`
  padding: 14px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${props => props.$color || '#F5F5F7'};
  border-radius: 12px;
  padding: 14px;
  position: relative;
 
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.$accent || '#00C9A7'};
  }
`;


const StatLabel = styled.p`
  margin: 0 0 4px 0;
  font-size: 11px;
  text-transform: uppercase;
  color: #8E8E93;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const StatValue = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1C1C1E;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-size: 18px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$active ? css`
    background: linear-gradient(135deg, #00C9A7 0%, #00AA6F 100%);
    color: white;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 201, 167, 0.4);
    }
  ` : css`
    background: linear-gradient(135deg, #722323ff 0%, #FF3B30 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 201, 167, 0.3);
    
    &:hover {
      background: #E8E8EA;
    }
  `}
`;


// 컴포넌트
const MarkerPanel = ({ selectedMarker, setSelectedMarker, postSwitching }) => {
  return (
    <PanelWrapper>
      <PanelContent>
        <PanelHeader>
          <HeaderTop>
            <Title>선택된 기기</Title>
            <CloseIcon onClick={() => setSelectedMarker(null)}>
              ×
            </CloseIcon>
          </HeaderTop>
          <CategoryTag>{selectedMarker.deviceType === 0 ? '💻 컴퓨터' :selectedMarker.deviceType === 1 ? '🍃 에어컨' : selectedMarker.deviceType === 2 ? '🔦 조명' : '기타'}</CategoryTag>
        </PanelHeader>
        
        
        <ContentBody>
          <StatsGrid>
            <StatCard $color="#F0FFFE" $accent="#00C9A7">
              <StatLabel>실시간 소비량</StatLabel>
              <StatValue>{selectedMarker.deviceId}</StatValue>
            </StatCard>
            
            <StatCard $color="#FFF8F0" $accent="#FF9500">
              <StatLabel>디바이스 이름</StatLabel>
              <StatValue>{selectedMarker.deviceName}</StatValue>
            </StatCard>

                <StatCard $color="#FFF8F0" $accent="#FF9500">
              <StatLabel>ON / OFF</StatLabel>
              <StatValue>{selectedMarker.status === 1 ? "켜짐" : "꺼짐"}</StatValue>
            </StatCard>
          </StatsGrid>
          
          <ActionButtons>
            <Button $active={selectedMarker.status === 1} $primary onClick={() => postSwitching(selectedMarker)}>
              {selectedMarker.status === 1 ? "OFF" : "ON"}
            </Button>
          </ActionButtons>
        </ContentBody>
      </PanelContent>
    </PanelWrapper>
  );
};

export default MarkerPanel;