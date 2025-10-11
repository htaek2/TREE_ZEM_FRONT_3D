import styled from "styled-components";
import { DEVICE_TYPES } from "../constants";

const Card = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 320px;
  max-width: 400px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translate(-50%, -60%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }

  @media (max-width: 768px) {
    min-width: 280px;
    max-width: 90vw;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ecf0f1;
  gap: 12px;
`;

const Icon = styled.div`
  font-size: 32px;
`;

const TitleContainer = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
`;

const Type = styled.span`
  font-size: 12px;
  color: #95a5a6;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #95a5a6;
  transition: color 0.2s;
  padding: 4px 8px;

  &:hover {
    color: #e74c3c;
  }
`;

const Body = styled.div`
  padding: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #ecf0f1;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
`;

const Value = styled.span`
  color: #7f8c8d;
  font-size: 14px;
  text-align: right;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) => props.color};
`;

const DeviceId = styled(Value)`
  font-family: monospace;
  font-size: 12px;
  color: #95a5a6;
`;

const Footer = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #ecf0f1;
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
`;

const ConfirmButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ControlButton = styled(Button)`
  background: ${(props) => (props.$isOn ? "#e74c3c" : "#2ecc71")};
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px
      ${(props) =>
        props.$isOn ? "rgba(231, 76, 60, 0.4)" : "rgba(46, 204, 113, 0.4)"};
  }

  &:active {
    transform: translateY(0);
  }
`;

function DeviceInfoCard({ device, onClose, onControl }) {
  if (!device) return null;

  const deviceConfig = DEVICE_TYPES[device.type];
  if (!deviceConfig) return null;

  const getStatusColor = (status) => {
    if (status === "정상") return "#2ECC71";
    if (status === "가동중") return "#3498DB";
    if (status === "대기") return "#F39C12";
    if (status === "점검필요") return "#E74C3C";
    if (status === "켜짐") return "#2ECC71";
    if (status === "꺼짐") return "#95A5A6";
    return "#95A5A6";
  };

  const renderDeviceInfo = () => {
    const info = [];

    if (device.specs) {
      info.push({ label: "사양", value: device.specs });
    }

    switch (device.type) {
      case "COMPUTER":
        if (device.lastCheck) {
          info.push({ label: "마지막 점검", value: device.lastCheck });
        }
        break;
      case "AIRCON":
        if (device.temperature) {
          info.push({ label: "설정 온도", value: device.temperature });
        }
        break;
      case "LIGHT":
        if (device.brightness) {
          info.push({ label: "밝기", value: device.brightness });
        }
        break;
    }

    return info;
  };

  const canControl = device.type === "AIRCON" || device.type === "LIGHT";
  const isOn =
    device.status === "가동중" ||
    device.status === "켜짐" ||
    device.status === "정상";

  const handleControl = () => {
    if (onControl) {
      onControl(device, !isOn);
    }
  };

  return (
    <Card>
      <Header>
        <Icon>{deviceConfig.icon}</Icon>
        <TitleContainer>
          <Title>{device.name}</Title>
          <Type>{deviceConfig.name}</Type>
        </TitleContainer>
        <CloseButton onClick={onClose} aria-label="닫기">
          ✕
        </CloseButton>
      </Header>

      <Body>
        <InfoRow>
          <Label>상태</Label>
          <StatusBadge color={getStatusColor(device.status)}>
            {device.status}
          </StatusBadge>
        </InfoRow>

        {renderDeviceInfo().map((item, index) => (
          <InfoRow key={index}>
            <Label>{item.label}</Label>
            <Value>{item.value}</Value>
          </InfoRow>
        ))}

        <InfoRow>
          <Label>ID</Label>
          <DeviceId>{device.id}</DeviceId>
        </InfoRow>
      </Body>

      <Footer>
        {canControl && (
          <ControlButton $isOn={isOn} onClick={handleControl}>
            {isOn ? "OFF" : "ON"}
          </ControlButton>
        )}
        <ConfirmButton onClick={onClose}>확인</ConfirmButton>
      </Footer>
    </Card>
  );
}

export default DeviceInfoCard;
